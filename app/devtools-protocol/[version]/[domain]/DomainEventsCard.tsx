/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProtocolVersionMetadata } from '@/data/ProtocolVersionModel';
import React from 'react';
import { ProtocolImplementationData } from '../data';
import { Card } from '@/ui/components/Card';
import { DomainMemberDescription } from './DomainMemberDescription';
import { DomainMemberParameters } from './DomainMemberParameters';
import { DomainMemberHeading } from './DomainMemberHeading';
import { Protocol } from '@/third-party/protocol-schema';
import { DomainMemberExternalComments } from './DomainMemberExternalComments';

export function DomainEventsCard({
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  domain: Protocol.Domain;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolVersionMetadata;
}) {
  return (
    domain.events != null &&
    domain.events?.length !== 0 && (
      <>
        <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
          Events
        </h2>
        <Card>
          {domain.events.map((event, index) => (
            <div key={event.name} className="group">
              {/* add horizontal separator if not the first item */}
              {index > 0 && <hr className="my-4" />}
              <DomainMemberHeading
                kind="event"
                member={event}
                domain={domain.domain}
                protocolImplementationData={protocolImplementationData}
                protocolMetadata={protocolMetadata}
              />
              <DomainMemberDescription member={event} />
              <DomainMemberExternalComments
                kind="event"
                memberKey={event.name}
                domain={domain.domain}
                protocolImplementationData={protocolImplementationData}
                protocolMetadata={protocolMetadata} />
              <DomainMemberParameters
                member={event}
                domain={domain.domain}
                versionSlug={protocolMetadata.versionSlug}
              />
            </div>
          ))}
        </Card>
      </>
    )
  );
}
