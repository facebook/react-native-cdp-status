/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {RuleTester} = require('eslint');
const {constants, ...requireCopyright} = require('./require-copyright');

const COPYRIGHT_HEADER = constants.COPYRIGHT_HEADER + '\n\n';
const {COPYRIGHT_DECLARATION} = constants;

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015 }
});

ruleTester.run(
  'require-copyright',
  requireCopyright,
  {
    valid: [
      {code: `#!/usr/bin/node 

${COPYRIGHT_HEADER}`},
      {code: COPYRIGHT_HEADER},
      {code: `/*
 * ${COPYRIGHT_DECLARATION}
 *
 * Copyright 2014 The Chromium Authors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * ...
 */`},
    ],
    invalid: [
      {code: '', output: COPYRIGHT_HEADER, errors: 1},
      {code: `/*
 * Copyright (c) Foobar
 */

const action = 'prepend';`,
        output: `/**
 * ${COPYRIGHT_DECLARATION}
 *
 * Copyright (c) Foobar
 */

const action = 'prepend';`,
        errors: 1,
      },
      {code: `/*
 * Copyright (c) Meta - Malformed
 */

const action = 'replace';`,
        output: `${COPYRIGHT_HEADER}const action = 'replace';`,
        errors: 1,
      },
      {code: `/**
 * Copyright (c) Meta - Malformed
 *
 * Copyright 2014 The Chromium Authors.All rights reserved.
 */

const action = 'give up';`,
        errors: 1,
      },
      {
        code: '/* Dummy Header */',
        output: `${COPYRIGHT_HEADER}/* Dummy Header */`,
        errors: 1,
      },
      {
        code: `/*
 * Copyright 2014 The Chromium Authors. All rights reserved.
 */`,
        output: `/**
 * ${COPYRIGHT_DECLARATION}
 *
 * Copyright 2014 The Chromium Authors. All rights reserved.
 */`,
        errors: 1,
      },
    ],
  }
);

