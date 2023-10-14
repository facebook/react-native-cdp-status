import { ProtocolMetadata, protocolVersionsModel } from '@/data/protocols';
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
import { notFound } from 'next/navigation';
import { implementationModelsById } from '@/data/implementations';
import { ImplementationModel } from '@/data/ImplementationModel';
import { GitHubCommitLink } from '@/ui/components/GitHubCommitLink';
import { GitHubCommitTime } from '@/ui/components/GitHubCommitTime';

export default async function Page({
  params: { version },
}: {
  params: {
    version: string;
  };
}) {
  const protocolVersion =
    await protocolVersionsModel.protocolVersionBySlug(version);
  if (!protocolVersion) {
    return notFound();
  }
  const protocol = await protocolVersion.protocol();
  const metadata = await protocolVersion.metadata();
  const protocolImplementationData = await getProtocolImplementationData(
    protocol.protocol,
  );

  return (
    <main className="p-4 flex-grow">
      <Card
        title={'Protocol version ' + metadata.versionName}
        topContent={
          <ProtocolVersionExternalLinks protocolMetadata={metadata} />
        }
      >
        <Markdown className="mb-2">{metadata.description}</Markdown>
        <DataSourceDescription name="Protocol" {...metadata.dataSource} />
        <ImplementationDataSourceDescription
          implementation={implementationModelsById.get('hermes')!}
        />
        <ImplementationStatsHeader />
        <ImplementationStats
          implementationId="hermes"
          implementation={implementationModelsById.get('hermes')!}
          protocol={protocol.protocol}
          protocolImplementationData={protocolImplementationData}
        />
      </Card>
    </main>
  );
}

async function ImplementationDataSourceDescription({
  implementation,
}: {
  implementation: ImplementationModel;
}) {
  const metadata = await implementation.getDataSourceMetadata();
  if (!metadata.github) {
    return null;
  }
  return (
    <DataSourceDescription name={implementation.displayName} {...metadata} />
  );
}

function DataSourceDescription({
  name,
  github,
}: {
  name: string;
  github?: {
    owner: string;
    repo: string;
    commitSha: string;
  };
}) {
  if (!github) {
    return null;
  }
  const { commitSha, owner, repo } = github;
  return (
    <p className="text-xs mb-1">
      {name} data is from{' '}
      <GitHubCommitLink commitSha={commitSha} owner={owner} repo={repo} />{' '}
      <GitHubCommitTime owner={owner} repo={repo} commitSha={commitSha} />.
    </p>
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
    <div className="float-right ml-1">
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
    <div className="lg:flex flex-row hidden">
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
  implementation,
  implementationId,
  protocol,
  protocolImplementationData,
}: {
  implementation: ImplementationModel;
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
      <div className="flex flex-row flex-wrap lg:gap-0 gap-y-2 gap-x-4 justify-start">
        <div className="text-base font-bold lg:w-1/6 pt-1 w-full">
          <span className="lg:hidden font-bold text-sm text-gray-500 dark:text-gray-400">
            Implementation:{' '}
          </span>
          <ImplementationLink
            implementationId={implementationId}
            implementation={implementation}
          />
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Coverage
          </div>
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
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Domains
          </div>
          {implementationStats.domainCount} / {protocolStats.domainCount}
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Commands
          </div>
          {implementationStats.commandCount} / {protocolStats.commandCount}
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Events
          </div>
          {implementationStats.eventCount} / {protocolStats.eventCount}
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Types
          </div>
          {implementationStats.typeCount} / {protocolStats.typeCount}
        </div>
      </div>
    </div>
  );
}

async function ImplementationLink({
  implementation,
  implementationId,
}: {
  implementation: ImplementationModel;
  implementationId: string;
}) {
  const dataSourceMetadata = await implementation.getDataSourceMetadata();
  let linkContents;
  switch (implementationId) {
    case 'hermes':
      linkContents = (
        <>
          Hermes{' '}
          <Image
            src="/images/hermes-logo.svg"
            width={20}
            height={20}
            alt=""
            title="Hermes CDPHandler"
            className="inline-block mb-1"
          />
        </>
      );
      break;

    default:
      linkContents = <span>{implementationId}</span>;
      break;
  }
  if (dataSourceMetadata.github) {
    return (
      <GitHubCommitLink {...dataSourceMetadata.github}>
        {linkContents}
      </GitHubCommitLink>
    );
  }
  return linkContents;
}

export async function generateStaticParams() {
  const params = [];
  for (const protocol of Array.from(
    await protocolVersionsModel.protocolVersions(),
  )) {
    const { versionSlug } = await protocol.metadata();
    params.push({
      version: versionSlug,
    });
  }
  return params;
}
