import { HermesImplementationModel } from './HermesImplementationModel';
import { IProtocol } from '@/third-party/protocol-schema';
import { ImplementationModel } from './ImplementationModel';

export const implementationModelsById: ReadonlyMap<
  string,
  ImplementationModel
> = new Map<string, ImplementationModel>([
  ['hermes', new HermesImplementationModel()],
]);
