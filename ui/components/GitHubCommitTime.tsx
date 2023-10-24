/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fetchWithOptions } from '@/data/fetchWithOptions';
import { octokit } from '@/data/github/octokit';
import TimeAgo from '@/ui/shims/react-timeago';
import React from 'react';

export async function GitHubCommitTime({
  owner,
  repo,
  commitSha,
}: {
  owner: string;
  repo: string;
  commitSha: string;
}) {
  const { data } = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: commitSha,
    request: {
      fetch: fetchWithOptions({
        next: {
          tags: ['GitHubCommitTime'],
        },
      }),
    },
  });
  const commitTime = data.commit.committer!.date!;
  return (
    <span suppressHydrationWarning>
      <TimeAgo date={commitTime} className="whitespace-nowrap" />
    </span>
  );
}
