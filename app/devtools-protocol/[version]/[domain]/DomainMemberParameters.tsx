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
