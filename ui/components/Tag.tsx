/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode } from 'react';

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
      {children}
    </span>
  );
}
