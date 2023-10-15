'use client';

import Link from 'next/link';
import { Protocol } from '@/third-party/protocol-schema';
import { useSelectedLayoutSegment } from 'next/navigation';

export function ProtocolDomainNavItem({
  domain,
  versionSlug,
}: {
  domain: Protocol.Domain;
  versionSlug: string;
}) {
  const segment = useSelectedLayoutSegment();

  return (
    <li className="flex flex-col">
      <Link
        className={`text-blue-600 hover:underline py-1 border-s-[16px] pl-4 hover:bg-stone-200 ${
          segment === domain.domain ? ' font-bold' : ''
        } ${
          domain.experimental
            ? 'border-red-300 dark:border-red-500'
            : 'deprecated' in domain && domain.deprecated
            ? 'border-orange-300 dark:border-orange-500'
            : 'border-transparent'
        }`}
        href={`/devtools-protocol/${encodeURIComponent(
          versionSlug,
        )}/${encodeURIComponent(domain.domain)}`}
      >
        {domain.domain}
      </Link>
    </li>
  );
}
