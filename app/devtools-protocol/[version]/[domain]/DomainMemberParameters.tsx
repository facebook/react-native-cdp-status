/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Protocol } from '@/third-party/protocol-schema';
import { PropsTable } from './PropsTable';

export function DomainMemberParameters({
  member,
  domain,
  versionSlug,
}: {
  member: Protocol.Event | Protocol.Command;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'parameters' in member && member.parameters && (
        <>
          <h4 className="font-bold text-lg mt-4 mb-2">Parameters</h4>
          <PropsTable
            items={member.parameters}
            domain={domain}
            versionSlug={versionSlug}
          />
        </>
      )}
    </>
  );
}
