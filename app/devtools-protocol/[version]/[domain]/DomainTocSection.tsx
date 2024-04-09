/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Link from 'next/link';
import React, { ReactNode } from 'react';
import { DimText } from '@/ui/components/DimText';
import { ProtocolImplementationData } from '../data';
import { FeatureStatusTags } from './FeatureStatusTags';
import { DomainMemberImplementationLink } from './DomainMemberImplementationLink';

export function DomainTocSection({
  kind,
  members,
  domain,
  children,
  protocolImplementationData,
}: {
  kind: 'method' | 'event' | 'type';
  members:
    | Array<
        {
          experimental?: boolean;
          deprecated?: boolean;
        } & ({ name: string } | { id: string })
      >
    | undefined;
  domain: string;
  children: ReactNode;
  protocolImplementationData: ProtocolImplementationData;
}) {
  return (
    members != null &&
    members.length !== 0 && (
      <>
        <h3 className="font-bold text-lg mt-4 mb-2">{children}</h3>
        <ul>
          {members.map((member) => {
            const key = 'name' in member ? member.name : member.id;
            return (
              <li key={key}>
                <Link
                  href={`#${kind}-${encodeURIComponent(key)}`}
                  className="text-blue-600 hover:underline font-mono"
                >
                  <DimText>{domain}.</DimText>
                  {key}
                </Link>{' '}
                <FeatureStatusTags for={member} />
                <DomainMemberImplementationLink
                  domain={domain}
                  implementationId="hermes"
                  kind={kind}
                  memberKey={key}
                  protocolImplementationData={protocolImplementationData}
                  small
                />
                <DomainMemberImplementationLink
                  domain={domain}
                  implementationId="hermes-legacy"
                  kind={kind}
                  memberKey={key}
                  protocolImplementationData={protocolImplementationData}
                  small
                />
                <DomainMemberImplementationLink
                  domain={domain}
                  implementationId="react-native"
                  kind={kind}
                  memberKey={key}
                  protocolImplementationData={protocolImplementationData}
                  small
                />
              </li>
            );
          })}
        </ul>
      </>
    )
  );
}
