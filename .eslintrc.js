/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ERROR = 2;

module.exports = {
    env: {
        'browser': true,
        'es2021': true,
        'node': true
    },
    extends: ['next/core-web-vitals', 'prettier', 'plugin:react/recommended'],
    overrides: [
        {
            env: {
                'node': true
            },
            files: [
                '.eslintrc.{js,cjs}'
            ],
            parserOptions: {
                'sourceType': 'script'
            }
        }
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint',
        'react',
        'cdp-project',
    ],
    rules: {
      'cdp-project/require-copyright': ERROR,
      'react/react-in-jsx-scope': 'off',
    }
}
