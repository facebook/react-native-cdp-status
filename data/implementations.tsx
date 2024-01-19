/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HermesImplementationModel } from './HermesImplementationModel';
import { ImplementationModel, MergedImplementationModel } from './ImplementationModel';
import { ReactNativeImplementationModel } from './ReactNativeImplementationModel';

const hermesImplementationModel = new HermesImplementationModel();
const reactNativeImplementationModel = new ReactNativeImplementationModel();

export const implementationModelsById: ReadonlyMap<
  string,
  ImplementationModel
> = new Map<string, ImplementationModel>([
  ['hermes', hermesImplementationModel],
  ['react-native', reactNativeImplementationModel],
  ['react-native-hermes', new MergedImplementationModel([reactNativeImplementationModel, hermesImplementationModel])],
]);
