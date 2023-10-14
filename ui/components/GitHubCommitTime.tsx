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
