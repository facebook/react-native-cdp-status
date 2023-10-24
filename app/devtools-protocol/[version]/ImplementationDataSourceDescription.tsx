/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ImplementationModel } from '@/data/ImplementationModel';
import { DataSourceDescription } from './DataSourceDescription';

export async function ImplementationDataSourceDescription({
  implementation,
}: {
  implementation: ImplementationModel;
}) {
  const metadata = await implementation.getDataSourceMetadata();
  if (!metadata.github) {
    return null;
  }
  return (
    <DataSourceDescription name={implementation.displayName} {...metadata} />
  );
}
