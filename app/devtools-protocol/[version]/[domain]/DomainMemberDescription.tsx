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
