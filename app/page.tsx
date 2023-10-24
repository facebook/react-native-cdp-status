/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Image from 'next/image';
import { redirect } from 'next/navigation';

export default function Home() {
  return redirect('/devtools-protocol');
}
