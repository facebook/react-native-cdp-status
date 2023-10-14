import React from 'react';
import { Markdown } from '@/ui/components/Markdown';
import { Protocol } from '@/third-party/protocol-schema';
import { Tag } from '@/ui/components/Tag';
import { FeatureStatusTags } from './FeatureStatusTags';
import { TypeLink } from './TypeLink';
import { TypeDetail } from './TypeDetail';

export function PropsTable({
  items,
  domain,
  versionSlug,
}: {
  items: Array<Protocol.PropertyType>;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {items.map((item) => (
        <React.Fragment key={item.name}>
          <div className="flex flex-row">
            <div className="w-2/5 text-end me-4 mb-4">
              <code className="font-mono">{item.name}</code>
              {'optional' in item && item.optional && (
                <>
                  <br />
                  <Tag>Optional</Tag>
                </>
              )}{' '}
            </div>
            <div className="w-3/5 mb-4">
              <TypeLink domain={domain} type={item} versionSlug={versionSlug} />
              {'description' in item && item.description && (
                <Markdown>{item.description}</Markdown>
              )}
              <TypeDetail type={item} />
              <FeatureStatusTags for={item} />
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
}
