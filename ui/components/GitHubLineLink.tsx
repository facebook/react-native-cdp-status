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
    <a href={url} target="_blank">
      {children}
    </a>
  );
}
