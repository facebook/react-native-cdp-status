import Link from 'next/link';
import React from 'react';
import { Protocol } from '@/third-party/protocol-schema';
import { resolveMaybeQualifiedRef } from '@/data/ProtocolModel';

export function TypeLink({
  type,
  domain,
  versionSlug,
  failIfEnum,
}: {
  type: Protocol.ProtocolType | undefined;
  domain: string;
  versionSlug: string;
  failIfEnum?: boolean;
}) {
  if (!type) {
    return <></>;
  }
  if (failIfEnum && 'enum' in type && type.enum) {
    throw new Error(`Unexpected enum in this context: ${JSON.stringify(type)}`);
  }
  if ('$ref' in type) {
    {
      const { $ref } = type;
      const { domain: resolvedDomain, localName } = resolveMaybeQualifiedRef({
        $ref,
        domain,
      });
      return (
        <Link
          href={`/devtools-protocol/${encodeURIComponent(
            versionSlug,
          )}/${encodeURIComponent(resolvedDomain)}#type-${encodeURIComponent(
            localName,
          )}`}
          className="text-blue-600 hover:underline font-mono font-bold"
        >
          {$ref}
        </Link>
      );
    }
  }
  switch (type.type) {
    case 'array':
      return (
        <code className="font-mono font-bold">
          array[{' '}
          <TypeLink
            type={type.items}
            domain={domain}
            versionSlug={versionSlug}
            failIfEnum
          />{' '}
          ]
        </code>
      );
    case 'object':
    case 'boolean':
    case 'integer':
    case 'string':
    case 'number':
    case 'any':
      return <code className="font-mono font-bold">{type.type}</code>;
    default: {
      throw new Error(`Unhandled type: ${JSON.stringify(type as never)}`);
    }
  }
}
