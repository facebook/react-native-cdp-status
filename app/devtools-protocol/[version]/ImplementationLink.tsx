/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

    case 'react-native':
      linkContents = (
        <>
          React Native{' '}
          <Image
            src="/images/react-native-logo.svg"
            width={20}
            height={20}
            alt=""
            title="React Native"
            className="inline-block mb-1"
          />
        </>
      );
      break;

    case 'react-native-hermes':
      linkContents = (
        <>
          React Native{' '}
          <Image
            src="/images/react-native-hermes-logo.svg"
            width={20}
            height={20}
            alt=""
            title="React Native + Hermes"
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
