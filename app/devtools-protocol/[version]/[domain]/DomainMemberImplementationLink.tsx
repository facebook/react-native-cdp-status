/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { ProtocolImplementationData } from '../data';
import { GitHubLineLink } from '@/ui/components/GitHubLineLink';

export function DomainMemberImplementationLink({
  implementationId,
  kind,
  domain,
  memberKey,
  protocolImplementationData,
  small,
}: {
  implementationId: 'hermes';
  kind: 'method' | 'event' | 'type';
  domain: string;
  memberKey: string;
  protocolImplementationData: ProtocolImplementationData;
  small?: boolean;
}) {
  const references =
    protocolImplementationData.referencesByImplementationId.get(
      implementationId,
    )?.references[
      kind === 'type' ? 'types' : kind === 'method' ? 'commands' : 'events'
    ]?.[domain + '.' + memberKey] ?? [];
  const primaryReference = references[0];
  let linkContents: ReactNode;

  switch (implementationId) {
    case 'hermes': {
      linkContents = (
        <Image
          src="/images/hermes-logo.svg"
          width={small ? 20 : 24}
          height={small ? 20 : 24}
          alt="Hermes"
          title="Referenced in Hermes CDPHandler"
          className="inline-block"
        />
      );
      break;
    }
    default:
      throw new Error(`Unhandled implementationId: ${implementationId}`);
  }
  if (!primaryReference) {
    return <></>;
  }
  if (primaryReference.github) {
    return (
      <GitHubLineLink
        owner={primaryReference.github.owner}
        repo={primaryReference.github.repo}
        line={primaryReference.line}
        commitRef={primaryReference.github.commitSha}
        path={primaryReference.github.path}
      >
        {linkContents}
      </GitHubLineLink>
    );
  }
  return <>{linkContents}</>;
}
