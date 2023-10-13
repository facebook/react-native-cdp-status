import React from 'react';
import { remark } from 'remark';
import html from 'remark-html';

import styles from './Markdown.module.scss';

export async function Markdown({ children }: { children: string }) {
  const htmlString = await remark().use(html).process(children);
  return (
    <div
      className={`${styles.markdown} mb-1`}
      dangerouslySetInnerHTML={{ __html: htmlString.toString() }}
    />
  );
}
