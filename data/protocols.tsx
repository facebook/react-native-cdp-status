/**
 * Process the raw protocol data by following similar logic to:
 *
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/merge-protocol-files.js
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/prep-tot-protocol-files.sh
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/pages/domainGenerator.js
 */

import { Protocol, IProtocol } from '@/third-party/protocol-schema';
import { HermesImplementationModel } from './HermesImplementationModel';

import { ReactNode } from 'react';
import { GitHubCommitLink } from '../ui/components/GitHubCommitLink';
import { ProtocolModel } from './ProtocolModel';
import { octokit } from './github/octokit';
import { fetchWithOptions } from './fetchWithOptions';

export type ProtocolDomain = Protocol.Domain;

type DomainMemberBase = {
  experimental?: boolean;
  deprecated?: boolean;
  optional?: boolean;
} & ({ name: string } | { id: string });

function memberSort(a: DomainMemberBase, b: DomainMemberBase) {
  if (a.experimental !== b.experimental) return a.experimental ? 1 : -1;
  if (a.deprecated !== b.deprecated) return a.deprecated ? 1 : -1;
  if (a.optional !== b.optional) return a.optional ? 1 : -1;
  const aKey = 'name' in a ? a.name : a.id;
  const bKey = 'name' in b ? b.name : b.id;
  return aKey.localeCompare(bKey);
}

function sortDomainMembers(domain: ProtocolDomain): ProtocolDomain {
  return {
    ...domain,
    ...(domain.commands && { commands: [...domain.commands].sort(memberSort) }),
    ...(domain.events && {
      events: [...domain.events].sort(memberSort),
    }),
    ...(domain.types && {
      types: [...domain.types].sort(memberSort),
    }),
  } as ProtocolDomain;
}

const isNotExperimentalOrDeprecated = (item: Protocol.Feature) =>
  !item.experimental && !item.deprecated;

export type ProtocolMetadata = {
  description: string;
  versionName: string;
  versionSlug: string;
  dataSourceDescription: ReactNode;
  isAvailableUpstream: boolean;
};

type ProtocolVersion = Readonly<{
  protocol: IProtocol | (() => Promise<IProtocol>);
  metadata: ProtocolMetadata;
}>;

const DEVTOOLS_PROTOCOL_REPO_OWNER = 'ChromeDevTools';
const DEVTOOLS_PROTOCOL_REPO_NAME = 'devtools-protocol';
const DEVTOOLS_PROTOCOL_REPO_BRANCH = 'master';

export class ProtocolVersionsModel {
  #devToolsProtocolsByVersionSlug:
    | ReadonlyMap<string, ProtocolVersion>
    | undefined;

  #devToolsProtocolRepoFetchMetadata: {
    commitSha: string;
  } | null = null;

  #loadDataPromise = null as null | Promise<void>;

  async #loadData() {
    if (this.#loadDataPromise) {
      return await this.#loadDataPromise;
    }
    this.#loadDataPromise = (async () => {
      {
        const { data } = await octokit.rest.repos.getBranch({
          owner: DEVTOOLS_PROTOCOL_REPO_OWNER,
          repo: DEVTOOLS_PROTOCOL_REPO_NAME,
          branch: DEVTOOLS_PROTOCOL_REPO_BRANCH,
          request: {
            fetch: fetchWithOptions({
              next: {
                revalidate: 3 * 3600, // 3 hours
              },
            }),
          },
        });
        const latestCommitSha = data.commit.sha;
        this.#devToolsProtocolRepoFetchMetadata = {
          commitSha: latestCommitSha,
        };
      }
      let devToolsBrowserProtocol, devToolsJsProtocol;
      {
        const { data } = await octokit.rest.repos.getContent({
          owner: DEVTOOLS_PROTOCOL_REPO_OWNER,
          repo: DEVTOOLS_PROTOCOL_REPO_NAME,
          path: 'json/browser_protocol.json',
          ref: this.#devToolsProtocolRepoFetchMetadata.commitSha,
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

        devToolsBrowserProtocol = JSON.parse(data as any);
      }
      {
        const { data } = await octokit.rest.repos.getContent({
          owner: DEVTOOLS_PROTOCOL_REPO_OWNER,
          repo: DEVTOOLS_PROTOCOL_REPO_NAME,
          path: 'json/js_protocol.json',
          ref: this.#devToolsProtocolRepoFetchMetadata.commitSha,
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

        devToolsJsProtocol = JSON.parse(data as any);
      }

      const totProtocol: IProtocol = {
        ...devToolsBrowserProtocol,
        domains: (
          [
            ...devToolsBrowserProtocol.domains,
            ...devToolsJsProtocol.domains,
          ] as ProtocolDomain[]
        )
          .map(sortDomainMembers)
          .sort((a, b) => a.domain.localeCompare(b.domain)),
      } as const;

      const dataSourceDescription = (
        <>
          Protocol data is from{' '}
          <GitHubCommitLink
            owner={DEVTOOLS_PROTOCOL_REPO_OWNER}
            repo={DEVTOOLS_PROTOCOL_REPO_NAME}
            commitSha={this.#devToolsProtocolRepoFetchMetadata.commitSha}
          />
          .
        </>
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
              dataSourceDescription,
              isAvailableUpstream: true,
            },
          },
        ],
        [
          'v8',
          {
            protocol: devToolsJsProtocol as IProtocol,
            metadata: {
              description: '',
              versionName: 'v8-inspector (node)',
              versionSlug: 'v8',
              dataSourceDescription,
              isAvailableUpstream: true,
            },
          },
        ],
        [
          `${devToolsBrowserProtocol.version.major}-${devToolsBrowserProtocol.version.minor}`,
          {
            protocol: {
              ...totProtocol,
              domains: totProtocol.domains
                .filter(isNotExperimentalOrDeprecated)
                .map(
                  (domain) =>
                    ({
                      ...domain,
                      commands: domain.commands?.filter(
                        isNotExperimentalOrDeprecated,
                      ),
                      events:
                        domain.events?.filter(isNotExperimentalOrDeprecated) ??
                        [],
                      types:
                        domain.types?.filter(isNotExperimentalOrDeprecated) ??
                        [],
                      // TODO: filter out command params, too? per https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js#L28C15-L28C22
                    }) as ProtocolDomain,
                ),
            },
            metadata: {
              description: '',
              versionName: `stable RC (${devToolsBrowserProtocol.version.major}.${devToolsBrowserProtocol.version.minor})`,
              versionSlug: `${devToolsBrowserProtocol.version.major}-${devToolsBrowserProtocol.version.minor}`,
              dataSourceDescription,
              isAvailableUpstream: true,
            },
          },
        ],
        [
          'hermes',
          {
            protocol: async () => {
              return await new HermesImplementationModel().filterProtocol(
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
              dataSourceDescription,
              isAvailableUpstream: false,
            },
          },
        ],
        // TODO: add data for stable (1.2)?
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

    const model = new ProtocolVersionModel(protocolVersion);
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

export class ProtocolVersionModel {
  protocolVersion: ProtocolVersion;

  constructor(protocolVersion: ProtocolVersion) {
    this.protocolVersion = protocolVersion;
  }

  #protocol = null as null | Promise<ProtocolModel>;

  async protocol() {
    if (this.#protocol) {
      return await this.#protocol;
    }
    this.#protocol = Promise.resolve(
      typeof this.protocolVersion.protocol === 'function'
        ? this.protocolVersion.protocol()
        : this.protocolVersion.protocol,
    ).then((protocol) => new ProtocolModel(protocol));
    try {
      return await this.#protocol;
    } catch (e) {
      this.#protocol = null;
      throw e;
    }
  }

  async metadata() {
    return this.protocolVersion.metadata;
  }
}

export const protocolVersionsModel = new ProtocolVersionsModel();
