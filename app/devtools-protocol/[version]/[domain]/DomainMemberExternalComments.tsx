/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProtocolVersionMetadata } from '@/data/ProtocolVersionModel';
import React from 'react';
import Image from 'next/image';
import { ProtocolImplementationData } from '../data';
import { DomainMemberImplementationLink } from './DomainMemberImplementationLink';
import { ReferenceComment } from '@/data/ImplementationModel';
import { Markdown } from '@/ui/components/Markdown';
import { GitHubCommitLink } from '@/ui/components/GitHubCommitLink';
import { GitHubLineLink } from '@/ui/components/GitHubLineLink';

function CommentImplementationIcon({
  implementationId,
}: {
  implementationId: string;
}) {
  switch (implementationId) {
    case 'hermes':
      return (
        <Image
          src="/images/hermes-logo.svg"
          width={20}
          height={20}
          alt=""
          title="Hermes CDPHandler"
          className="inline-block mb-1"
        />
      );
    case 'react-native':
      return (
        <Image
          src="/images/react-native-logo.svg"
          width={20}
          height={20}
          alt=""
          title="React Native"
          className="inline-block mb-1"
        />
      );
    case 'react-native-hermes':
      return (
        <Image
          src="/images/react-native-hermes-logo.svg"
          width={20}
          height={20}
          alt=""
          title="React Native Hermes"
          className="inline-block mb-1"
        />
      );
    default:
      return <>{implementationId}</>;
  }
}

function CommentSourceLink({
  comment,
  implementationId,
}: {
  comment: ReferenceComment;
  implementationId: string;
}) {
  if (comment.github) {
    return (
      <div
        className="
          text-xs
          text-gray-500
          dark:text-gray-400
          flex-row
          flex
          items-center
          justify-end
        "
      >
        <GitHubLineLink
          owner={comment.github.owner}
          repo={comment.github.repo}
          line={comment.line}
          commitRef={comment.github.commitSha}
          path={comment.github.path}
        >
          <CommentImplementationIcon implementationId={implementationId} />{' '}
          {comment.github.owner}/{comment.github.repo}/…/
          {getFileName(comment.github.path)}:{comment.line}
        </GitHubLineLink>
      </div>
    );
  }
}

function DomainMemberExternalCommentsForImplementation({
  kind,
  memberKey,
  domain,
  protocolImplementationData,
  implementationId,
}: {
  kind: 'method' | 'event' | 'type';
  memberKey: string;
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
  implementationId: string;
}) {
  const references =
    protocolImplementationData.referencesByImplementationId.get(
      implementationId,
    )?.references[
      kind === 'type' ? 'types' : kind === 'method' ? 'commands' : 'events'
    ]?.[domain + '.' + memberKey] ?? [];
  const contentfulCommentReferences = references.filter(
    (reference) =>
      'comment' in reference &&
      reference.comment != null &&
      reference.isContentfulComment,
  ) as ReferenceComment[];
  if (!contentfulCommentReferences.length) {
    return null;
  }
  return (
    <>
      {contentfulCommentReferences.map((reference, index) => (
        <div key={index}>
          <div
            className="bg-gray-100
            dark:bg-gray-700
            border border-gray-300
            rounded
            p-2
            text-sm
            break-words"
          >
            <Markdown className="font-mono">{reference.comment}</Markdown>
            <CommentSourceLink
              comment={reference}
              implementationId={implementationId}
            />
          </div>
        </div>
      ))}
    </>
  );
}

export function DomainMemberExternalComments({
  kind,
  memberKey,
  domain,
  protocolImplementationData,
}: {
  kind: 'method' | 'event' | 'type';
  memberKey: string;
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
}) {
  return (
    <div className="flex-col gap-4 flex">
      <DomainMemberExternalCommentsForImplementation
        domain={domain}
        implementationId="react-native"
        kind={kind}
        memberKey={memberKey}
        protocolImplementationData={protocolImplementationData}
      />
    </div>
  );
}

function getFileName(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}
