/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GitHubCommitLink } from '@/ui/components/GitHubCommitLink';
import {
  ImplementationModel,
  ImplementationModelBase,
  ImplementationProtocolReferences,
} from './ImplementationModel';
import { IProtocol } from '@/third-party/protocol-schema';
import { octokit } from './github/octokit';
import { fetchWithOptions } from './fetchWithOptions';
import lineColumn from 'line-column';
import {
  ParsedAndIndexedCdpComments,
  parseAndIndexCdpComments,
} from './CdpComments';

const HERMES_CDP_DIR = 'API/hermes/cdp';

const HERMES_REPO_OWNER = 'facebook';
const HERMES_REPO_NAME = 'hermes';
const HERMES_REPO_BRANCH = 'main';

export class HermesImplementationModel
  extends ImplementationModelBase
  implements ImplementationModel
{
  constructor() {
    super();
  }

  readonly displayName = 'Hermes';

  #cdpAgentSourcePaths: Array<string> = [];
  #cdpCodegenSourcePaths: Array<string> = [];
  #files = new Map<string, string>();
  #repoFetchMetadata: {
    owner: string;
    repo: string;
    commitSha: string;
  } | null = null;
  #fetchDataPromise: Promise<void> | undefined;
  #indexedCdpComments: ParsedAndIndexedCdpComments | undefined;

  async #listDirectory(path: string): Promise<
    {
      path: string;
    }[]
  > {
    const { owner, repo, commitSha } = this.#repoFetchMetadata!;

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: commitSha,
      mediaType: {
        format: 'raw',
      },
      request: {
        fetch: fetchWithOptions({
          next: {
            revalidate: 3600, // 1 hour
          },
        }),
      },
    });
    if (!Array.isArray(data)) {
      throw new Error('Not a directory: ' + path);
    }
    const files = data;
    // recurse into subdirectories
    const subdirectories = files.filter((file) => file.type === 'dir');
    const subdirectoryContents = await Promise.all(
      subdirectories.map((subdirectory) =>
        this.#listDirectory(subdirectory.path),
      ),
    );
    const subdirectoryFiles = subdirectoryContents.flat();
    return [...files, ...subdirectoryFiles];
  }

  async #fetchFile(path: string) {
    if (this.#files.has(path)) {
      return;
    }
    const { owner, repo, commitSha } = this.#repoFetchMetadata!;

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: commitSha,
      mediaType: {
        format: 'raw',
      },
      request: {
        fetch: fetchWithOptions({
          next: {
            revalidate: 3600, // 1 hour
          },
        }),
      },
    });
    this.#files.set(path, data as any);
  }

  #fetchData() {
    if (this.#fetchDataPromise) {
      return this.#fetchDataPromise;
    }
    this.#fetchDataPromise = (async () => {
      try {
        {
          const { data } = await octokit.rest.repos.getBranch({
            owner: HERMES_REPO_OWNER,
            repo: HERMES_REPO_NAME,
            branch: HERMES_REPO_BRANCH,
            request: {
              fetch: fetchWithOptions({
                next: {
                  revalidate: 3 * 3600, // 3 hours
                },
              }),
            },
          });
          const latestCommitSha = data.commit.sha;
          this.#repoFetchMetadata = {
            owner: HERMES_REPO_OWNER,
            repo: HERMES_REPO_NAME,
            commitSha: latestCommitSha,
          };
        }
        const cdpSourcePaths = (await this.#listDirectory(HERMES_CDP_DIR))
          .filter(
            (file) => file.path.endsWith('.cpp') || file.path.endsWith('.h'),
          )
          .map((file) => file.path);
        this.#cdpAgentSourcePaths = cdpSourcePaths.filter(
          (path) => !path.includes('/Message'),
        );
        this.#cdpCodegenSourcePaths = cdpSourcePaths.filter((path) =>
          path.includes('/Message'),
        );
        await Promise.all(
          [...this.#cdpAgentSourcePaths, ...this.#cdpCodegenSourcePaths].map(
            (path) => this.#fetchFile(path),
          ),
        );
        this.#indexedCdpComments = parseAndIndexCdpComments(
          this.#cdpAgentSourcePaths.map((path) => {
            return [
              {
                github: {
                  owner: HERMES_REPO_OWNER,
                  repo: HERMES_REPO_NAME,
                  commitSha: this.#repoFetchMetadata!.commitSha,
                  path,
                },
              },
              this.#files.get(path)!,
            ];
          }),
        );
      } catch (e) {
        this.#fetchDataPromise = undefined;
        throw e;
      }
    })();
    return this.#fetchDataPromise;
  }

  async extractProtocolReferences(protocol: IProtocol) {
    await this.#fetchData();
    const references: ImplementationProtocolReferences = {
      commands: {},
      events: {},
      types: {},
    };
    const findAndPushMatches = (
      pathsToSearch: string[],
      obj: typeof references.commands | typeof references.events,
      name: string,
      needles: string[],
    ) => {
      const regex = new RegExp(
        '(\\b|(?<=\\s|[()]))' +
          '(' +
          needles.map((needle) => escapeRegExp(needle)).join('|') +
          ')' +
          '(\\b|(?=\\s|[()]))',
        'g',
      );
      for (const path of pathsToSearch) {
        const file = this.#files.get(path)!;
        const lc = lineColumn(file);
        for (const match of file.matchAll(regex)) {
          obj[name] = obj[name] ?? [];
          const { line, col } = lc.fromIndex(match.index!)!;
          obj[name].push({
            github: {
              owner: HERMES_REPO_OWNER,
              repo: HERMES_REPO_NAME,
              commitSha: this.#repoFetchMetadata!.commitSha,
              path,
            },
            line,
            column: col,
          });
        }
      }
    };
    const findAndPushCommentMentions = (
      obj: typeof references.commands | typeof references.events,
      name: string,
    ) => {
      const comments = this.#indexedCdpComments!.commentsByCdpSymbol.get(name);
      if (!comments) {
        return;
      }
      for (const comment of comments) {
        obj[name] = obj[name] ?? [];
        obj[name].push({
          github: comment.github,
          line: comment.line,
          column: comment.column,
          comment: comment.cleanedText,
          isContentfulComment: comment.hasAdditionalContent,
        });
      }
    };
    for (const domain of protocol.domains) {
      for (const command of domain.commands ?? []) {
        findAndPushCommentMentions(
          references.commands,
          `${domain.domain}.${command.name}`,
        );
        const hermesRequestId = `m::${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(command.name)}Request`;
        const hermesResponseId = `m::${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(command.name)}Response`;
        const stringLiteral = quoteCppString(
          `${domain.domain}.${command.name}`,
        );
        findAndPushMatches(
          this.#cdpAgentSourcePaths,
          references.commands,
          `${domain.domain}.${command.name}`,
          [hermesRequestId, hermesResponseId, stringLiteral],
        );
      }
      for (const event of domain.events ?? []) {
        const hermesEventId = `m::${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(event.name)}Notification`;
        const stringLiteral = quoteCppString(`${domain.domain}.${event.name}`);
        findAndPushCommentMentions(
          references.events,
          `${domain.domain}.${event.name}`,
        );
        findAndPushMatches(
          this.#cdpAgentSourcePaths,
          references.events,
          `${domain.domain}.${event.name}`,
          [hermesEventId, stringLiteral],
        );
      }
      for (const type of domain.types ?? []) {
        const hermesTypeId = `${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(type.id)}`;
        findAndPushCommentMentions(
          references.types,
          `${domain.domain}.${type.id}`,
        );
        findAndPushMatches(
          this.#cdpCodegenSourcePaths,
          references.types,
          `${domain.domain}.${type.id}`,
          [hermesTypeId],
        );
      }
    }
    return references;
  }

  async getDataSourceMetadata() {
    await this.#fetchData();
    const { owner, repo, commitSha } = this.#repoFetchMetadata!;
    return {
      github: {
        owner,
        repo,
        commitSha,
      },
    };
  }
}

function pascalCaseToCamelCase(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

function camelCaseToPascalCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function quoteCppString(str: string) {
  return `"${str.replace(/"/g, '\\"')}"`;
}
