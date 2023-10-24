/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Protocol } from '@/third-party/protocol-schema';
import { PropsTable } from './PropsTable';

export function DomainMethodReturnObject({
  command,
  domain,
  versionSlug,
}: {
  command: Protocol.Command;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'returns' in command &&
        command.returns != null &&
        command.returns.length !== 0 && (
          <>
            <h4 className="font-bold text-lg mt-4 mb-2">Return object</h4>
            <PropsTable
              items={command.returns}
              domain={domain}
              versionSlug={versionSlug}
            />
          </>
        )}
    </>
  );
}
