import { ReactNode } from 'react';

export function DimText({ children }: { children: ReactNode }) {
  return <span className="text-gray-600">{children}</span>;
}
