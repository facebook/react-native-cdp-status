/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HermesImplementationModel } from './HermesImplementationModel';
import { IProtocol } from '@/third-party/protocol-schema';
import { ImplementationModel } from './ImplementationModel';

export const implementationModelsById: ReadonlyMap<
  string,
  ImplementationModel
> = new Map<string, ImplementationModel>([
  ['hermes', new HermesImplementationModel()],
]);
