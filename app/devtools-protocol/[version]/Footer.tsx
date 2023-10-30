/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ExternalLink } from '@/ui/components/ExternalLink';

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-sm p-4 flex justify-between text-center">
      <span>
        <ExternalLink href="https://github.com/ChromeDevTools/devtools-logo" className="pe-1">
          Chrome DevTools logo
        </ExternalLink>
        used under a
        <ExternalLink href="https://creativecommons.org/licenses/by/4.0/" className="ps-1 pe-1">
          CC BY 4.0
        </ExternalLink>
        license.
      </span>
      <span className="font-bold">
        Copyright © Meta Platforms, Inc
      </span>
      <span className="flex space-x-2">
        <ExternalLink href="https://opensource.fb.com/legal/terms" className="whitespace-nowrap">
          Terms
        </ExternalLink>
        <ExternalLink href="https://opensource.fb.com/legal/privacy" className="whitespace-nowrap">
          Privacy
        </ExternalLink>
      </span>
    </footer>
  );
}
