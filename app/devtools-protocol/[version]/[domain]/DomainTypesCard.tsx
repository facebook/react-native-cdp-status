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
import { TypeLink } from './TypeLink';
import { TypeDetail } from './TypeDetail';
import { DomainMemberDescription } from './DomainMemberDescription';
import { TypeProperties } from './TypeProperties';
import { DomainMemberHeading } from './DomainMemberHeading';
import { Protocol } from '@/third-party/protocol-schema';

export function DomainTypesCard({
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  domain: Protocol.Domain;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolVersionMetadata;
}) {
  return (
    domain.types != null &&
    domain.types.length !== 0 && (
      <>
        <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">Types</h2>
        <Card>
          {domain.types.map((type, index) => (
            <div key={type.id} className="group">
              {/* add horizontal separator if not the first item */}
              {index > 0 && <hr className="my-4" />}
              <DomainMemberHeading
                kind="type"
                member={type}
                domain={domain.domain}
                protocolImplementationData={protocolImplementationData}
                protocolMetadata={protocolMetadata}
              />
              <DomainMemberDescription member={type} />
              <p>
                Type:{' '}
                <TypeLink
                  type={type}
                  domain={domain.domain}
                  versionSlug={protocolMetadata.versionSlug}
                />
              </p>
              <TypeDetail type={type} />
              <TypeProperties
                type={type}
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
