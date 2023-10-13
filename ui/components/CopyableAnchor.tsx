'use client';

import Link from 'next/link';
import { useState, useCallback, SyntheticEvent } from 'react';

export function CopyableAnchor({ href }: { href: string }) {
  const url =
    globalThis.location != null
      ? new URL(href, globalThis.location.href).href
      : // SSR fallback; this will not be used.
        href;

  const [copied, setCopied] = useState(false);

  const onClick = useCallback(
    (e: SyntheticEvent) => {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    [url],
  );

  return (
    <>
      <Link
        href={href}
        onClick={onClick}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-blue-600 hover:underline focus:underline font-mono font-bold"
        scroll={false}
      >
        #
      </Link>
      <span
        className={`${
          copied ? 'opacity-100' : 'transition-opacity opacity-0'
        } after:content-['Copied_URL!']
          ms-4
          font-normal text-xs text-gray-500
        `}
      ></span>
    </>
  );
}
