import React, { ReactNode } from 'react';

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
      {children}
    </span>
  );
}
