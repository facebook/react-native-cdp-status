import { ExternalLink } from '@/ui/components/ExternalLink';
import Image from 'next/image';

export function GitHubCommitLink({
  owner,
  repo,
  commitSha,
}: {
  owner: string;
  repo: string;
  commitSha: string;
}) {
  return (
    <ExternalLink
      href={`https://github.com/${encodeURIComponent(
        owner,
      )}/${encodeURIComponent(repo)}/tree/${encodeURIComponent(commitSha)}`}
    >
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
    </ExternalLink>
  );
}
