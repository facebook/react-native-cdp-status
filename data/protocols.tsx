/**
 * Process the raw protocol data by following similar logic to:
 *
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/merge-protocol-files.js
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/prep-tot-protocol-files.sh
 * https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/pages/domainGenerator.js
 */

import DevToolsBrowserProtocol from 'devtools-protocol/json/browser_protocol.json';
import DevToolsJsProtocol from 'devtools-protocol/json/js_protocol.json';
import { Protocol, IProtocol } from '@/third-party/protocol-schema';
import { HermesImplementationModel } from './HermesImplementationModel';

import DevToolsProtocolPackage from 'devtools-protocol/package.json';
import { ReactNode } from 'react';
import { Markdown } from '@/ui/components/Markdown';
import { NpmPackageVersionLink } from './components/NpmPackageVersionLink';

const totProtocol: IProtocol = {
  ...DevToolsBrowserProtocol,
  domains: (
    [
      ...DevToolsBrowserProtocol.domains,
      ...DevToolsJsProtocol.domains,
    ] as ProtocolDomain[]
  )
    .map(sortDomainMembers)
    .sort((a, b) => a.domain.localeCompare(b.domain)),
} as const;

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

const dataSourceDescription = (
  <>
    Protocol data is from{' '}
    <NpmPackageVersionLink
      name={DevToolsProtocolPackage.name}
      version={DevToolsProtocolPackage.version}
    />
    .
  </>
);

const devToolsProtocolsByVersionSlug: ReadonlyMap<
  string,
  Readonly<{
    protocol: IProtocol | (() => Promise<IProtocol>);
    metadata: {
      description: string;
      versionName: string;
      versionSlug: string;
      dataSourceDescription: ReactNode;
    };
  }>
> = new Map([
  [
    'tot',
    {
      protocol: totProtocol,
      metadata: {
        description: '',
        versionName: 'latest (tip-of-tree)',
        versionSlug: 'tot',
        dataSourceDescription,
      },
    },
  ],
  [
    'v8',
    {
      protocol: DevToolsJsProtocol as IProtocol,
      metadata: {
        description: '',
        versionName: 'v8-inspector (node)',
        versionSlug: 'v8',
        dataSourceDescription,
      },
    },
  ],
  [
    `${DevToolsBrowserProtocol.version.major}-${DevToolsBrowserProtocol.version.minor}`,
    {
      protocol: {
        ...totProtocol,
        domains: totProtocol.domains.filter(isNotExperimentalOrDeprecated).map(
          (domain) =>
            ({
              ...domain,
              commands: domain.commands?.filter(isNotExperimentalOrDeprecated),
              events:
                domain.events?.filter(isNotExperimentalOrDeprecated) ?? [],
              types: domain.types?.filter(isNotExperimentalOrDeprecated) ?? [],
              // TODO: filter out command params, too? per https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js#L28C15-L28C22
            }) as ProtocolDomain,
        ),
      },
      metadata: {
        description: '',
        versionName: `stable RC (${DevToolsBrowserProtocol.version.major}.${DevToolsBrowserProtocol.version.minor})`,
        versionSlug: `${DevToolsBrowserProtocol.version.major}-${DevToolsBrowserProtocol.version.minor}`,
        dataSourceDescription,
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
      },
    },
  ],
  // TODO: add data for stable (1.2)?
]);

export { devToolsProtocolsByVersionSlug };
