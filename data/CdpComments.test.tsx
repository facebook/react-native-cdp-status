/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parseAndIndexCdpComments } from './CdpComments';

describe('CdpComments', () => {
  const files = [[{
    github: {
      owner: 'owner',
      repo: 'repo',
      commitSha: '00000000',
      path: 'main.js',
    }
  }, `
// This is a single line comment mentioning @cdp symbol1
/* @cdp symbol1 is mentioned in this block comment */
/**
 * This is a multiline comment
 * that also mention @cdp symbol1
 */
const x = 10; // This is an inline @cdp symbol1 comment
/**
 * This is a multiline comment
 * with two lines
 * mentioning @cdp
 * symbol1
 */
// @cdp symbol1
// @cdp symbol2

// separate comment @cdp symbol2
`]] as const;

  test('parseAndIndexCdpComments', () => {
    const result = parseAndIndexCdpComments(files);
    expect(result).toMatchSnapshot();
  });
});