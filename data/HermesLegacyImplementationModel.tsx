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

const CDP_HANDLER_CPP = 'API/hermes/inspector/chrome/CDPHandler.cpp';
const MESSAGE_TYPES_H = 'API/hermes/inspector/chrome/MessageTypes.h';

const HERMES_REPO_OWNER = 'facebook';
const HERMES_REPO_NAME = 'hermes';
const HERMES_REPO_BRANCH = 'main';

export class HermesLegacyImplementationModel
  extends ImplementationModelBase
  implements ImplementationModel
{
  constructor() {
    super();
  }

  readonly displayName = 'Hermes (CDPHandler)';

  #files = new Map<string, string>();
  #repoFetchMetadata: {
    owner: string;
    repo: string;
    commitSha: string;
  } | null = null;
  #fetchDataPromise: Promise<void> | undefined;

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
        await Promise.all([
          this.#fetchFile(CDP_HANDLER_CPP),
          this.#fetchFile(MESSAGE_TYPES_H),
        ]);
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
        '\\b' +
          '(' +
          needles.map((needle) => escapeRegExp(needle)).join('|') +
          ')' +
          '\\b',
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
    for (const domain of protocol.domains) {
      for (const command of domain.commands ?? []) {
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
          [CDP_HANDLER_CPP],
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
        findAndPushMatches(
          [CDP_HANDLER_CPP],
          references.events,
          `${domain.domain}.${event.name}`,
          [hermesEventId, stringLiteral],
        );
      }
      for (const type of domain.types ?? []) {
        const hermesTypeId = `${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(type.id)}`;
        findAndPushMatches(
          [MESSAGE_TYPES_H],
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
