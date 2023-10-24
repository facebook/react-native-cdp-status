/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Protocol } from '@/third-party/protocol-schema';
import { PropsTable } from './PropsTable';

export function TypeProperties({
  type,
  domain,
  versionSlug,
}: {
  type: Protocol.ProtocolType;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'properties' in type && type.properties && (
        <>
          <h4 className="font-bold text-lg mt-4 mb-2">Properties</h4>
          <PropsTable
            items={type.properties}
            domain={domain}
            versionSlug={versionSlug}
          />
        </>
      )}
    </>
  );
}
