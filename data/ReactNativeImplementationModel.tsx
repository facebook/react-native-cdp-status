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

const JSINSPECTOR_MODERN_DIR =
  'packages/react-native/ReactCommon/jsinspector-modern';

const REACT_NATIVE_REPO_OWNER = 'facebook';
const REACT_NATIVE_REPO_NAME = 'react-native';
const REACT_NATIVE_REPO_BRANCH = 'main';

export class ReactNativeImplementationModel
  extends ImplementationModelBase
  implements ImplementationModel
{
  constructor() {
    super();
  }

  readonly displayName = 'React Native';

  #jsinspectorSourcePaths: Array<string> = [];
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
            owner: REACT_NATIVE_REPO_OWNER,
            repo: REACT_NATIVE_REPO_NAME,
            branch: REACT_NATIVE_REPO_BRANCH,
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
            owner: REACT_NATIVE_REPO_OWNER,
            repo: REACT_NATIVE_REPO_NAME,
            commitSha: latestCommitSha,
          };
        }
        this.#jsinspectorSourcePaths = (
          await this.#listDirectory(JSINSPECTOR_MODERN_DIR)
        )
          .filter(
            (file) => file.path.endsWith('.cpp') || file.path.endsWith('.h'),
          )
          .map((file) => file.path);
        await Promise.all(
          this.#jsinspectorSourcePaths.map((path) => this.#fetchFile(path)),
        );
        this.#indexedCdpComments = parseAndIndexCdpComments(
          this.#jsinspectorSourcePaths.map((path) => {
            return [
              {
                github: {
                  owner: REACT_NATIVE_REPO_OWNER,
                  repo: REACT_NATIVE_REPO_NAME,
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
              owner: REACT_NATIVE_REPO_OWNER,
              repo: REACT_NATIVE_REPO_NAME,
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
        const stringLiteral = quoteCppString(
          `${domain.domain}.${command.name}`,
        );
        findAndPushMatches(
          this.#jsinspectorSourcePaths,
          references.commands,
          `${domain.domain}.${command.name}`,
          [stringLiteral],
        );
      }
      for (const event of domain.events ?? []) {
        const stringLiteral = quoteCppString(`${domain.domain}.${event.name}`);
        findAndPushCommentMentions(
          references.events,
          `${domain.domain}.${event.name}`,
        );
        findAndPushMatches(
          this.#jsinspectorSourcePaths,
          references.events,
          `${domain.domain}.${event.name}`,
          [stringLiteral],
        );
      }
      for (const type of domain.types ?? []) {
        findAndPushCommentMentions(
          references.types,
          `${domain.domain}.${type.id}`,
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
