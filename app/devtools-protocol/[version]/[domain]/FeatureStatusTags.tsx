/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Protocol } from '@/third-party/protocol-schema';

export function FeatureStatusTags({ for: for_ }: { for: Protocol.Feature }) {
  return (
    <>
      {'experimental' in for_ && for_.experimental && (
        <span className="bg-red-300 dark:bg-red-500 rounded-lg px-2 py-1 text-sm text-gray-700 dark:text-gray-800 font-sans font-normal">
          Experimental
        </span>
      )}
      {'deprecated' in for_ && for_.deprecated && (
        <span className="bg-orange-300 dark:bg-orange-500 rounded-lg px-2 py-1 text-sm text-gray-700 dark:text-gray-800 font-sans font-normal">
          Deprecated
        </span>
      )}
    </>
  );
}
