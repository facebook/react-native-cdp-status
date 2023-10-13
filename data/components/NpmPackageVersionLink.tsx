import { ExternalLink } from '@/ui/components/ExternalLink';
import Image from 'next/image';
import npmFetch from 'npm-registry-fetch';
import { version } from 'os';

export async function NpmPackageVersionLink({
  name,
  version,
}: {
  name: string;
  version: string;
}) {
  const versionData = await npmFetch.json(
    `/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
  );
  return (
    <>
      <ExternalLink
        href={`https://www.npmjs.com/package/${encodeURIComponent(
          name,
        )}/v/${encodeURIComponent(version)}`}
      >
        <code>
          {name}@{version}
        </code>
      </ExternalLink>
      <GitCommitLink versionData={versionData} />
    </>
  );
}

function GitCommitLink({
  versionData,
}: {
  versionData: {
    repository?: {
      type: 'git';
      url: string;
    };
    gitHead?: string;
  };
}) {
  if (
    !versionData.repository ||
    versionData.repository.type !== 'git' ||
    !versionData.gitHead
  ) {
    return <>Nope 1</>;
  }
  if (
    !versionData.repository.url.startsWith('git+https://github.com/') ||
    !versionData.repository.url.endsWith('.git')
  ) {
    return <>Nope</>;
  }
  const url = versionData.repository.url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
  return (
    <>
      {' '}
      (
      <ExternalLink href={`${url}/tree/${versionData.gitHead}`}>
        <Image
          src="/images/github-mark.svg"
          alt="GitHub"
          width={12}
          height={12}
          className="inline-block mb-1"
        />
        <code className="ms-1">{versionData.gitHead.slice(0, 7)}</code>
      </ExternalLink>
      )
    </>
  );
}
