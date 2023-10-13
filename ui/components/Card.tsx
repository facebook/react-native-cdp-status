import React, { ReactNode } from 'react';

export function Card({
  title,
  children,
  topContent,
}: {
  title?: string;
  children?: ReactNode;
  topContent?: ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 my-4 max-w-4xl mx-auto">
      {topContent}
      {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );
}
