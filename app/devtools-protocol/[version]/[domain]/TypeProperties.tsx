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
