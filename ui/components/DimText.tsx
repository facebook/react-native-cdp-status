/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ReactNode } from 'react';

export function DimText({ children }: { children: ReactNode }) {
  return <span className="text-gray-600 dark:text-gray-400">{children}</span>;
}
