/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ReactNode } from 'react';

export function ExternalLink({
  className = '',
  href,
  children,
}: {
  className?: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={(className.length > 0 ? `${className} ` : '') + "text-blue-600 hover:underline"}>
      {children}
      <ExternalLinkIcon />
    </a>
  );
}

export function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 140"
      height={12}
      width={12}
      className="inline-block ms-1"
    >
      <path
        d="M120.09 16.696H60.256V.096L120.09.09z"
        className="fill-blue-600"
      />
      <path
        d="M57.99 48.64l42.573-42.574 13.475 13.475-42.574 42.58z"
        className="fill-blue-600"
      />
      <path
        d="M119.98.107l.02 59.83-16.59.013-.02-59.846zM3 23.5h17v87H3zm83.49 52.56h17V113h-17z"
        className="fill-blue-600"
      />
      <path
        d="M3 16.692h40.655v17H3zM3 96h100.49v17H3z"
        className="fill-blue-600"
      />
    </svg>
  );
}
