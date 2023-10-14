import { ProtocolMetadata } from '@/data/protocols';
import React from 'react';
import Image from 'next/image';

export function DomainExternalLinks({
  domain,
  protocolMetadata,
}: {
  domain: string;
  protocolMetadata: ProtocolMetadata;
}) {
  const upstreamVersionSlug = protocolMetadata.isAvailableUpstream
    ? protocolMetadata.versionSlug
    : 'tot';
  // TODO: Check against our local copy of the `tot` version to see if this particular domain is available.
  const cdpUrl = `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
    upstreamVersionSlug,
  )}/${encodeURIComponent(domain)}`;
  return (
    <div className="float-right ml-1">
      <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
        <Image
          src="/images/chrome-devtools-circle-responsive.svg"
          width={24}
          height={24}
          alt="Chrome DevTools"
          about=""
        />
      </a>
    </div>
  );
}
