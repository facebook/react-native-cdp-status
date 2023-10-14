import { GitHubCommitLink } from '@/ui/components/GitHubCommitLink';
import { GitHubCommitTime } from '@/ui/components/GitHubCommitTime';

export function DataSourceDescription({
  name,
  github,
}: {
  name: string;
  github?: {
    owner: string;
    repo: string;
    commitSha: string;
  };
}) {
  if (!github) {
    return null;
  }
  const { commitSha, owner, repo } = github;
  return (
    <p className="text-xs mb-1">
      {name} data is from{' '}
      <GitHubCommitLink commitSha={commitSha} owner={owner} repo={repo} />{' '}
      <GitHubCommitTime owner={owner} repo={repo} commitSha={commitSha} />.
    </p>
  );
}
