/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProtocolVersionMetadata } from '@/data/ProtocolVersionModel';
import Image from 'next/image';

export function ProtocolVersionExternalLinks({
  protocolMetadata,
}: {
  protocolMetadata: ProtocolVersionMetadata;
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
