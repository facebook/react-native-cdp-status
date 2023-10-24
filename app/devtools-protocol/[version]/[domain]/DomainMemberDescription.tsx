/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Markdown } from '@/ui/components/Markdown';

export function DomainMemberDescription({
  member,
}: {
  member: {
    description?: string;
  };
}) {
  return (
    <>
      {'description' in member && member.description && (
        <Markdown>{member.description}</Markdown>
      )}
    </>
  );
}
