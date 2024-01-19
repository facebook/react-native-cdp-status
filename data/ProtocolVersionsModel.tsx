/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fetchWithOptions } from './fetchWithOptions';
import { HermesImplementationModel } from './HermesImplementationModel';
import { IProtocol } from '@/third-party/protocol-schema';
import { octokit } from './github/octokit';
import { Protocol } from '@/third-party/protocol-schema';
import { ProtocolVersion, ProtocolVersionModel } from './ProtocolVersionModel';
import { implementationModelsById } from './implementations';

type DomainMemberBase = {
  experimental?: boolean;
  deprecated?: boolean;
  optional?: boolean;
} & ({ name: string } | { id: string });

const DEVTOOLS_PROTOCOL_REPO = {
  owner: 'ChromeDevTools',
  repo: 'devtools-protocol',
  branch: 'master',
};

const DEVTOOLS_PROTOCOL_VIEWER_REPO = {
  owner: 'ChromeDevTools',
  repo: 'debugger-protocol-viewer',
  branch: 'master',
};

export class ProtocolVersionsModel {
  #devToolsProtocolsByVersionSlug:
    | ReadonlyMap<string, ProtocolVersion>
    | undefined;

  #devToolsProtocolRepoFetchMetadata: {
    devToolsCommitSha: string;
    devToolsProtocolViewerCommitSha: string;
  } | null = null;

  #loadDataPromise = null as null | Promise<void>;

  async #loadData() {
    if (this.#loadDataPromise) {
      return await this.#loadDataPromise;
    }
    this.#loadDataPromise = (async () => {
      this.#devToolsProtocolRepoFetchMetadata = {
        devToolsCommitSha: await getHeadCommitSha(DEVTOOLS_PROTOCOL_REPO),
        devToolsProtocolViewerCommitSha: await getLatestCommitForFile({
          ...DEVTOOLS_PROTOCOL_VIEWER_REPO,
          path: 'pages/_data/1-2.json',
        }),
      };

      // TODO: Validate that the fetched data matches the protocol schema

      const devToolsBrowserProtocol: IProtocol = JSON.parse(
        await fetchFileFromGitHub({
          owner: DEVTOOLS_PROTOCOL_REPO.owner,
          repo: DEVTOOLS_PROTOCOL_REPO.repo,
          ref: this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
          path: 'json/browser_protocol.json',
        }),
      );

      const devToolsJsProtocol: IProtocol = JSON.parse(
        await fetchFileFromGitHub({
          owner: DEVTOOLS_PROTOCOL_REPO.owner,
          repo: DEVTOOLS_PROTOCOL_REPO.repo,
          ref: this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
          path: 'json/js_protocol.json',
        }),
      );

      const totProtocol: IProtocol = createTipOfTreeProtocol(
        devToolsBrowserProtocol,
        devToolsJsProtocol,
      );

      this.#devToolsProtocolsByVersionSlug = new Map([
        [
          'tot',
          {
            protocol: totProtocol,
            metadata: {
              description: '',
              versionName: 'latest (tip-of-tree)',
              versionSlug: 'tot',
              dataSource: {
                github: {
                  owner: DEVTOOLS_PROTOCOL_REPO.owner,
                  repo: DEVTOOLS_PROTOCOL_REPO.repo,
                  commitSha:
                    this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
                  path: 'json/',
                },
              },
              isAvailableUpstream: true,
            },
          },
        ],
        [
          'v8',
          {
            protocol: devToolsJsProtocol,
            metadata: {
              description: '',
              versionName: 'v8-inspector (node)',
              versionSlug: 'v8',
              dataSource: {
                github: {
                  owner: DEVTOOLS_PROTOCOL_REPO.owner,
                  repo: DEVTOOLS_PROTOCOL_REPO.repo,
                  commitSha:
                    this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
                  path: 'json/',
                },
              },
              isAvailableUpstream: true,
            },
          },
        ],
        [
          `${devToolsBrowserProtocol.version.major}-${devToolsBrowserProtocol.version.minor}`,
          {
            protocol: makeStableProtocol(totProtocol),
            metadata: {
              description: '',
              versionName: `stable RC (${devToolsBrowserProtocol.version.major}.${devToolsBrowserProtocol.version.minor})`,
              versionSlug: `${devToolsBrowserProtocol.version.major}-${devToolsBrowserProtocol.version.minor}`,
              dataSource: {
                github: {
                  owner: DEVTOOLS_PROTOCOL_REPO.owner,
                  repo: DEVTOOLS_PROTOCOL_REPO.repo,
                  commitSha:
                    this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
                  path: 'json/',
                },
              },
              isAvailableUpstream: true,
            },
          },
        ],
        [
          '1-2',
          {
            protocol: async () => {
              return sortProtocolDomainsAndMembers(
                JSON.parse(
                  await fetchFileFromGitHub({
                    owner: DEVTOOLS_PROTOCOL_VIEWER_REPO.owner,
                    repo: DEVTOOLS_PROTOCOL_VIEWER_REPO.repo,
                    ref: this.#devToolsProtocolRepoFetchMetadata!
                      .devToolsProtocolViewerCommitSha,
                    path: 'pages/_data/1-2.json',
                  }),
                ),
              );
            },
            metadata: {
              description: '',
              versionName: 'stable (1.2)',
              versionSlug: '1-2',
              dataSource: {
                github: {
                  owner: DEVTOOLS_PROTOCOL_VIEWER_REPO.owner,
                  repo: DEVTOOLS_PROTOCOL_VIEWER_REPO.repo,
                  commitSha:
                    this.#devToolsProtocolRepoFetchMetadata
                      .devToolsProtocolViewerCommitSha,
                  path: 'pages/_data/1-2.json',
                },
              },
              isAvailableUpstream: true,
            },
          },
        ],
        [
          'hermes',
          {
            protocol: async () => {
              return await implementationModelsById.get('hermes')!.filterProtocol(
                totProtocol,
              );
            },
            metadata: {
              description: `
NOTE: The "Hermes" protocol version is a subset of \`latest\` filtered automatically to include only:
* Protocol messages currently implemented in Hermes.
* Protocol types referenced transitively by those messages - including types that might not be implemented/referenced in the Hermes code.
  `,
              versionName: 'hermes',
              versionSlug: 'hermes',
              dataSource: {
                github: {
                  owner: DEVTOOLS_PROTOCOL_REPO.owner,
                  repo: DEVTOOLS_PROTOCOL_REPO.repo,
                  commitSha:
                    this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
                  path: 'json/',
                },
              },
              isAvailableUpstream: false,
            },
          },
        ],
        [
          'react-native-hermes',
          {
            protocol: async () => {
              return await implementationModelsById.get('react-native-hermes')!.filterProtocol(
                totProtocol,
              );
            },
            metadata: {
              description: `
NOTE: The "React Native + Hermes" protocol version is a subset of \`latest\` filtered automatically to include only protocol messages implemented in React Native or Hermes (or both).
`,
              versionName: 'React Native + Hermes',
              versionSlug: 'react-native-hermes',
              dataSource: {
                github: {
                  owner: DEVTOOLS_PROTOCOL_REPO.owner,
                  repo: DEVTOOLS_PROTOCOL_REPO.repo,
                  commitSha:
                    this.#devToolsProtocolRepoFetchMetadata.devToolsCommitSha,
                  path: 'json/',
                },
              },
              isAvailableUpstream: false,
            }
          }
        ]
      ]);
    })();
    try {
      return await this.#loadDataPromise;
    } catch (e) {
      this.#loadDataPromise = null;
      throw e;
    }
  }

  constructor() {}

  #protocolVersionBySlug = new Map<string, ProtocolVersionModel>();

  async protocolVersionBySlug(versionSlug: string) {
    await this.#loadData();
    if (this.#protocolVersionBySlug.has(versionSlug)) {
      return this.#protocolVersionBySlug.get(versionSlug)!;
    }
    const protocolVersion =
      this.#devToolsProtocolsByVersionSlug!.get(versionSlug);
    if (!protocolVersion) {
      return null;
    }

    const model = new ProtocolVersionModel(protocolVersion, versionSlug);
    this.#protocolVersionBySlug.set(versionSlug, model);
    return model;
  }

  async protocolVersionBySlugEnforcing(versionSlug: string) {
    const protocolVersion = await this.protocolVersionBySlug(versionSlug);
    if (!protocolVersion) {
      throw new Error(`No protocol version ${versionSlug}`);
    }
    return protocolVersion;
  }

  async protocolVersions() {
    await this.#loadData();
    return Promise.all(
      Array.from(this.#devToolsProtocolsByVersionSlug!.keys()).map(
        (versionSlug) => this.protocolVersionBySlugEnforcing(versionSlug),
      ),
    );
  }
}

function makeStableProtocol(
  totProtocol: IProtocol,
): IProtocol | (() => Promise<IProtocol>) {
  // Based on https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js
  return {
    ...totProtocol,
    domains: totProtocol.domains.filter(isNotExperimentalOrDeprecated).map(
      (domain) =>
        ({
          ...domain,
          commands: domain.commands?.filter(isNotExperimentalOrDeprecated),
          events: domain.events?.filter(isNotExperimentalOrDeprecated) ?? [],
          types: domain.types?.filter(isNotExperimentalOrDeprecated) ?? [],
          // TODO: filter out command params, too? per https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js#L28C15-L28C22
        }) as Protocol.Domain,
    ),
  };
}

function createTipOfTreeProtocol(
  firstProtocol: IProtocol,
  ...rest: IProtocol[]
): IProtocol {
  // Based on https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/merge-protocol-files.js
  return sortProtocolDomainsAndMembers({
    ...firstProtocol,
    domains: [
      ...firstProtocol.domains,
      ...rest.flatMap((protocol) => protocol.domains),
    ],
  });
}

function sortProtocolDomainsAndMembers(protocol: IProtocol): IProtocol {
  return {
    ...protocol,
    domains: protocol.domains
      .map(sortDomainMembers)
      .sort((a, b) => a.domain.localeCompare(b.domain)),
  };
}

function sortDomainMembers(domain: Protocol.Domain): Protocol.Domain {
  // Based on https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/pages/domainGenerator.js
  return {
    ...domain,
    ...(domain.commands && { commands: [...domain.commands].sort(memberSort) }),
    ...(domain.events && {
      events: [...domain.events].sort(memberSort),
    }),
    ...(domain.types && {
      types: [...domain.types].sort(memberSort),
    }),
  } as Protocol.Domain;
}

const isNotExperimentalOrDeprecated = (item: Protocol.Feature) =>
  !item.experimental && !item.deprecated;

function memberSort(a: DomainMemberBase, b: DomainMemberBase) {
  if (a.experimental !== b.experimental) return a.experimental ? 1 : -1;
  if (a.deprecated !== b.deprecated) return a.deprecated ? 1 : -1;
  if (a.optional !== b.optional) return a.optional ? 1 : -1;
  const aKey = 'name' in a ? a.name : a.id;
  const bKey = 'name' in b ? b.name : b.id;
  return aKey.localeCompare(bKey);
}

async function getHeadCommitSha({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch: string;
}) {
  const { data } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch,
    request: {
      fetch: fetchWithOptions({
        next: {
          revalidate: 3 * 3600, // 3 hours
        },
      }),
    },
  });
  return data.commit.sha;
}

async function fetchFileFromGitHub({
  owner,
  repo,
  ref,
  path,
}: {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}): Promise<string> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
    mediaType: {
      format: 'raw',
    },
    request: {
      fetch: fetchWithOptions({
        next: {
          tags: ['ProtocolVersionsModel'],
        },
      }),
    },
  });
  return data as any;
}

async function getLatestCommitForFile({
  owner,
  repo,
  path,
  branch,
}: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
}): Promise<string> {
  const {
    data: [commit],
  } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    path,
    per_page: 1,
    ref: branch,
    request: {
      fetch: fetchWithOptions({
        next: {
          revalidate: 3 * 3600, // 3 hours
        },
      }),
    },
  });
  return commit.sha;
}
