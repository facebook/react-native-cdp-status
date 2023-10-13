import { HermesImplementationModel } from './HermesImplementationModel';
import { Protocol } from './protocols';

export type ImplementationProtocolReferences = {
  commands: Record<
    string,
    {
      path: string;
      match: string;
      index: number;
      length: number;
    }[]
  >;
  events: Record<
    string,
    {
      path: string;
      match: string;
      index: number;
      length: number;
    }[]
  >;
  types: Record<
    string,
    {
      path: string;
      match: string;
      index: number;
      length: number;
    }[]
  >;
};

export interface ImplementationModel {
  extractProtocolReferences(
    protocol: Protocol,
  ): Promise<ImplementationProtocolReferences>;
}

export const implementationModelsById: ReadonlyMap<
  string,
  ImplementationModel
> = new Map<string, ImplementationModel>([
  ['hermes', new HermesImplementationModel()],
]);
