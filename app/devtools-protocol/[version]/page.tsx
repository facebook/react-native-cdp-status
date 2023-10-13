import {
  ProtocolMetadata,
  devToolsProtocolsByVersionSlug,
} from '@/data/protocols';
import { Card } from '@/ui/components/Card';
import {
  ProtocolImplementationData,
  getProtocolImplementationData,
} from './data';
import { IProtocol } from '@/third-party/protocol-schema';
import { ProtocolModel, parseQualifiedRef } from '@/data/ProtocolModel';
import { useMemo } from 'react';
import Image from 'next/image';
import { Markdown } from '@/ui/components/Markdown';

export default async function Page({
  params: { version },
}: {
  params: {
    version: string;
  };
}) {
  const protocol = devToolsProtocolsByVersionSlug.get(version)!;
  const resolvedProtocol = await (typeof protocol.protocol === 'function'
    ? protocol.protocol()
    : protocol.protocol);
  const protocolImplementationData =
    await getProtocolImplementationData(resolvedProtocol);

  return (
    <main className="p-4 flex-grow">
      <Card
        title={'Protocol version ' + protocol.metadata.versionName}
        topContent={
          <ProtocolVersionExternalLinks protocolMetadata={protocol.metadata} />
        }
      >
        <Markdown>{protocol.metadata.description}</Markdown>
        <p className="text-xs">{protocol.metadata.dataSourceDescription}</p>
        <ImplementationStatsHeader />
        <ImplementationStats
          implementationId="hermes"
          protocol={resolvedProtocol}
          protocolImplementationData={protocolImplementationData}
        />
      </Card>
    </main>
  );
}

function ProtocolVersionExternalLinks({
  protocolMetadata,
}: {
  protocolMetadata: ProtocolMetadata;
}) {
  const cdpUrl = protocolMetadata.isAvailableUpstream
    ? `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
        protocolMetadata.versionSlug,
      )}`
    : null;
  return (
    <div className="float-right">
      {cdpUrl && (
        <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
          <Image
            src="/images/chrome-devtools-circle-responsive.svg"
            width={24}
            height={24}
            alt="Chrome DevTools"
            about=""
          />
        </a>
      )}
    </div>
  );
}

function ImplementationStatsHeader() {
  return (
    <div className="flex flex-row">
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Implementation
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Coverage
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Domains
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Commands
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Events
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Types
      </div>
    </div>
  );
}

function ImplementationStats({
  implementationId,
  protocol,
  protocolImplementationData,
}: {
  implementationId: string;
  protocol: IProtocol;
  protocolImplementationData: ProtocolImplementationData;
}) {
  const protocolModel = useMemo(() => new ProtocolModel(protocol), [protocol]);
  const { references } =
    protocolImplementationData.referencesByImplementationId.get(
      implementationId,
    )!;
  let protocolStats = {
    commandCount: 0,
    eventCount: 0,
    typeCount: 0,
    domainCount: 0,
  };
  for (const domain of protocol.domains) {
    protocolStats.commandCount += domain.commands?.length ?? 0;
    protocolStats.eventCount += domain.events?.length ?? 0;
    protocolStats.typeCount += domain.types?.length ?? 0;
    if (
      domain.commands?.length ||
      domain.events?.length ||
      domain.types?.length
    ) {
      protocolStats.domainCount++;
    }
  }
  const implementationStats = {
    commandCount: 0,
    eventCount: 0,
    typeCount: 0,
    domainCount: 0,
  };
  const referencedDomains = new Set<string>();
  for (const [command, commandReferences] of Object.entries(
    references.commands,
  )) {
    if (commandReferences.length) {
      implementationStats.commandCount++;
      const { domain } = parseQualifiedRef(command);
      referencedDomains.add(domain);
    }
  }
  for (const [event, eventReferences] of Object.entries(references.events)) {
    if (eventReferences.length) {
      implementationStats.eventCount++;
      const { domain } = parseQualifiedRef(event);
      referencedDomains.add(domain);
    }
  }
  for (const [type, typeReferences] of Object.entries(references.types)) {
    if (typeReferences.length) {
      implementationStats.typeCount++;
      const { domain } = parseQualifiedRef(type);
      referencedDomains.add(domain);
    }
  }
  implementationStats.domainCount = referencedDomains.size;
  return (
    <div>
      {/* percentages */}
      <div className="flex flex-row">
        <div className="flex-grow text-2xl font-bold w-1/6">
          <ImplementationLink implementationId={implementationId} />
        </div>
        <div className="flex-grow text-2xl font-bold w-1/6">
          {Math.round(
            (100 *
              (implementationStats.commandCount +
                implementationStats.eventCount +
                implementationStats.typeCount)) /
              (protocolStats.commandCount +
                protocolStats.eventCount +
                protocolStats.typeCount),
          )}
          %
        </div>
        {/* domains */}
        <div className="flex-grow text-2xl font-bold w-1/6">
          {implementationStats.domainCount} / {protocolStats.domainCount}
        </div>
        <div className="flex-grow text-2xl font-bold w-1/6">
          {implementationStats.commandCount} / {protocolStats.commandCount}
        </div>
        <div className="flex-grow text-2xl font-bold w-1/6">
          {implementationStats.eventCount} / {protocolStats.eventCount}
        </div>
        <div className="flex-grow text-2xl font-bold w-1/6">
          {implementationStats.typeCount} / {protocolStats.typeCount}
        </div>
      </div>
    </div>
  );
}

function ImplementationLink({
  implementationId,
}: {
  implementationId: string;
}) {
  switch (implementationId) {
    case 'hermes': {
      return (
        <span className="font-light">
          <Image
            src="/images/hermes-logo.svg"
            width={24}
            height={24}
            alt=""
            title="Hermes CDPHandler"
            className="inline-block"
          />{' '}
          Hermes
        </span>
      );
    }
    default:
      return <span>{implementationId}</span>;
  }
}

export async function generateStaticParams() {
  const params = [];
  for (const protocol of Array.from(devToolsProtocolsByVersionSlug.values())) {
    params.push({
      version: protocol.metadata.versionSlug,
    });
  }
  return params;
}
