/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProtocolVersionMetadata } from '@/data/ProtocolVersionModel';
import React from 'react';
import { CopyableAnchor } from '@/ui/components/CopyableAnchor';
import { DimText } from '@/ui/components/DimText';
import { ProtocolImplementationData } from '../data';
import { FeatureStatusTags } from './FeatureStatusTags';
import { DomainMemberExternalLinks } from './DomainMemberExternalLinks';

export function DomainMemberHeading({
  kind,
  member,
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  kind: 'method' | 'event' | 'type';
  member: {
    experimental?: boolean;
    deprecated?: boolean;
  } & ({ name: string } | { id: string });
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolVersionMetadata;
}) {
  const key = 'name' in member ? member.name : member.id;
  return (
    <>
      <DomainMemberExternalLinks
        kind={kind}
        memberKey={key}
        domain={domain}
        protocolImplementationData={protocolImplementationData}
        protocolMetadata={protocolMetadata}
      />
      <h3
        className="font-bold text-lg mt-4 mb-2 max-w-5xl mx-auto font-mono"
        id={`${kind}-${encodeURIComponent(key)}`}
      >
        <DimText>{domain}.</DimText>
        {key} <FeatureStatusTags for={member} />
        <CopyableAnchor href={`#${kind}-${encodeURIComponent(key)}`} />
      </h3>
    </>
  );
}
