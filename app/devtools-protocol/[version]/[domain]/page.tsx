import { protocolVersionsModel } from '@/data/protocols';
import { notFound } from 'next/navigation';
import React from 'react';
import { getProtocolImplementationData } from '../data';
import { DomainTocCard } from './DomainTocCard';
import { DomainMethodsCard } from './DomainMethodsCard';
import { DomainEventsCard } from './DomainEventsCard';
import { DomainTypesCard } from './DomainTypesCard';

export default async function ProtocolVersionDomainPage({
  params: { version, domain: domainName },
}: {
  params: {
    version: string;
    domain: string;
  };
}) {
  const protocolVersion =
    await protocolVersionsModel.protocolVersionBySlug(version);
  if (!protocolVersion) {
    return notFound();
  }
  const protocol = await protocolVersion.protocol();
  const domain = protocol.domain(domainName);
  if (!domain) {
    return notFound();
  }
  const protocolImplementationData = await getProtocolImplementationData(
    protocol.protocol,
  );
  const protocolMetadata = await protocolVersion.metadata();
  return (
    <main className="p-4 flex-grow">
      <DomainTocCard
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
      <DomainMethodsCard
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
      <DomainEventsCard
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
      <DomainTypesCard
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const params = [];
  for (const protocolVersion of Array.from(
    await protocolVersionsModel.protocolVersions(),
  )) {
    const { domains } = (await protocolVersion.protocol()).protocol;
    const { versionSlug } = await protocolVersion.metadata();
    for (const domain of domains) {
      params.push({
        version: versionSlug,
        domain: domain.domain,
      });
    }
  }
  return params;
}
