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

const totProtocol = {
  domains: [...DevToolsBrowserProtocol.domains, ...DevToolsJsProtocol.domains]
    .map(sortDomainMembers)
    .sort((a, b) => a.domain.localeCompare(b.domain)),
} as const;

export type ProtocolDomain = (
  | typeof DevToolsJsProtocol
  | typeof DevToolsBrowserProtocol
)['domains'][number];

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
    commands: [...domain.commands].sort(memberSort),
    ...(domain.events && {
      events: [...domain.events].sort(memberSort),
    }),
    ...(domain.types && {
      types: [...domain.types].sort(memberSort),
    }),
  } as ProtocolDomain;
}

const isNotExperimentalOrDeprecated = <
  T extends {
    experimental?: boolean;
    deprecated?: boolean;
    [key: string]: unknown;
  },
>(
  item: T,
) => !item.experimental && !item.deprecated;

const devToolsProtocolsByVersionSlug: ReadonlyMap<
  string,
  Readonly<{
    protocol: {
      domains: ProtocolDomain[];
    };
    metadata: {
      versionName: string;
      versionSlug: string;
    };
  }>
> = new Map([
  [
    'tot',
    {
      protocol: totProtocol,
      metadata: { versionName: 'latest (tip-of-tree)', versionSlug: 'tot' },
    },
  ],
  [
    'v8',
    {
      protocol: DevToolsJsProtocol,
      metadata: { versionName: 'v8-inspector (node)', versionSlug: 'v8' },
    },
  ],
  [
    `${DevToolsBrowserProtocol.version.major}-${DevToolsBrowserProtocol.version.minor}`,
    {
      protocol: {
        domains: totProtocol.domains.filter(isNotExperimentalOrDeprecated).map(
          (domain) =>
            ({
              ...domain,
              commands: domain.commands.filter(isNotExperimentalOrDeprecated),
              events:
                domain.events?.filter(isNotExperimentalOrDeprecated) ?? [],
              types: domain.types?.filter(isNotExperimentalOrDeprecated) ?? [],
              // TODO: filter out command params, too? per https://github.com/ChromeDevTools/debugger-protocol-viewer/blob/85935f731864d54fa60d67548d2fd9862ef4014d/make-stable-protocol.js#L28C15-L28C22
            }) as ProtocolDomain,
        ),
      },
      metadata: {
        versionName: `stable RC (${DevToolsBrowserProtocol.version.major}.${DevToolsBrowserProtocol.version.minor})`,
        versionSlug: `${DevToolsBrowserProtocol.version.major}-${DevToolsBrowserProtocol.version.minor}`,
      },
    },
  ],
  // TODO: add data for stable (1.2)?
]);

export { devToolsProtocolsByVersionSlug };
