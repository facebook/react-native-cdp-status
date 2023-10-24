/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode } from 'react';

export function GitHubLineLink({
  owner,
  repo,
  line,
  commitRef,
  path,
  children,
}: {
  owner: string;
  repo: string;
  line: number;
  commitRef: string;
  path: string;
  children: ReactNode;
}) {
  const url = `https://github.com/${encodeURIComponent(
    owner,
  )}/${encodeURIComponent(repo)}/blob/${encodeURIComponent(
    commitRef,
  )}/${encodeURI(path)}#L${encodeURIComponent(line)}`;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
