/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ExternalLink } from '@/ui/components/ExternalLink';
import Image from 'next/image';

export function GitHubCommitLink({
  owner,
  repo,
  commitSha,
  path,
  children,
}: {
  owner: string;
  repo: string;
  commitSha: string;
  path?: string;
  children?: React.ReactNode;
}) {
  const url =
    `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(
      repo,
    )}/${path != null ? 'blob' : 'tree'}/${encodeURIComponent(commitSha)}` +
    (path != null ? `/${encodeURI(path)}` : '');
  if (children) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <ExternalLink href={url}>
      <GitHubCommitLabel owner={owner} repo={repo} commitSha={commitSha} />
    </ExternalLink>
  );
}

export function GitHubCommitLabel({
  owner,
  repo,
  commitSha,
}: {
  owner: string;
  repo: string;
  commitSha: string;
}) {
  return (
    <span className="whitespace-nowrap">
      <Image
        src="/images/github-mark.svg"
        alt="GitHub"
        width={12}
        height={12}
        className="inline-block mb-1"
      />
      <code className="ms-1">
        {owner}/{repo}@{commitSha.slice(0, 7)}
      </code>
    </span>
  );
}
