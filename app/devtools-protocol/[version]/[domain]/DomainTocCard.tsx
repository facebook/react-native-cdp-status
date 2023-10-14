import { ProtocolDomain, ProtocolMetadata } from '@/data/protocols';
import React from 'react';
import { Markdown } from '@/ui/components/Markdown';
import { ProtocolImplementationData } from '../data';
import { Card } from '@/ui/components/Card';
import { FeatureStatusTags } from './FeatureStatusTags';
import { DomainExternalLinks } from './DomainExternalLinks';
import { DomainTocSection } from './DomainTocSection';

export function DomainTocCard({
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  domain: ProtocolDomain;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolMetadata;
}) {
  return (
    <Card
      title={`${domain.domain} Domain`}
      topContent={
        <DomainExternalLinks
          domain={domain.domain}
          protocolMetadata={protocolMetadata}
        />
      }
    >
      {'description' in domain && domain.description && (
        <Markdown>{domain.description}</Markdown>
      )}
      <FeatureStatusTags for={domain} />
      <DomainTocSection
        kind="method"
        members={domain.commands}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Methods
      </DomainTocSection>
      <DomainTocSection
        kind="event"
        members={domain.events}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Events
      </DomainTocSection>
      <DomainTocSection
        kind="type"
        members={domain.types}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Types
      </DomainTocSection>
    </Card>
  );
}
