/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProtocolVersionMetadata } from '@/data/ProtocolVersionModel';
import React from 'react';
import Image from 'next/image';
import { ProtocolImplementationData } from '../data';
import { DomainMemberImplementationLink } from './DomainMemberImplementationLink';

export function DomainMemberExternalLinks({
  kind,
  memberKey,
  domain,
  protocolImplementationData,
  protocolMetadata,
}: {
  kind: 'method' | 'event' | 'type';
  memberKey: string;
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
  protocolMetadata: ProtocolVersionMetadata;
}) {
  const upstreamVersionSlug = protocolMetadata.isAvailableUpstream
    ? protocolMetadata.versionSlug
    : 'tot';
  // TODO: Check against our local copy of the `tot` version to see if this particular member is available.
  const cdpUrl = `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
    upstreamVersionSlug,
  )}/${encodeURIComponent(domain)}#${encodeURIComponent(
    kind,
  )}-${encodeURIComponent(memberKey)}`;
  return (
    <div className="float-right ml-1 flex-row gap-1 flex">
      <DomainMemberImplementationLink
        domain={domain}
        implementationId="hermes"
        kind={kind}
        memberKey={memberKey}
        protocolImplementationData={protocolImplementationData}
      />
      <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
        <Image
          src="/images/chrome-devtools-circle-responsive.svg"
          width={24}
          height={24}
          alt="Chrome DevTools"
          className="inline-block"
        />
      </a>
    </div>
  );
}
