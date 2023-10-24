/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// returns a fetch-compatible function with prepopulated parameter defaults that get shallowly merged into the caller-provided options
export function fetchWithOptions(defaultOptions: RequestInit) {
  return (url: string, options?: RequestInit) => {
    return fetch(url, {
      ...defaultOptions,
      ...options,
    });
  };
}
