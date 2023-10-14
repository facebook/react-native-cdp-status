import Image from 'next/image';
import { ImplementationModel } from '@/data/ImplementationModel';
import { GitHubCommitLink } from '@/ui/components/GitHubCommitLink';

export async function ImplementationLink({
  implementation,
  implementationId,
}: {
  implementation: ImplementationModel;
  implementationId: string;
}) {
  const dataSourceMetadata = await implementation.getDataSourceMetadata();
  let linkContents;
  switch (implementationId) {
    case 'hermes':
      linkContents = (
        <>
          Hermes{' '}
          <Image
            src="/images/hermes-logo.svg"
            width={20}
            height={20}
            alt=""
            title="Hermes CDPHandler"
            className="inline-block mb-1"
          />
        </>
      );
      break;

    default:
      linkContents = <span>{implementationId}</span>;
      break;
  }
  if (dataSourceMetadata.github) {
    return (
      <GitHubCommitLink {...dataSourceMetadata.github}>
        {linkContents}
      </GitHubCommitLink>
    );
  }
  return linkContents;
}
