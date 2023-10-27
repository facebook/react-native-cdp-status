/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: [
      'app',
      'third-party',
      'ui',
      'data',
      'eslint',
    ],
    files: [
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.js',
    ],
  }
};

module.exports = nextConfig;
