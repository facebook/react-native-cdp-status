import { IProtocol, Protocol } from '@/third-party/protocol-schema';
import { ProtocolModel } from './ProtocolModel';

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
    protocol: IProtocol,
  ): Promise<ImplementationProtocolReferences>;
  filterProtocol(protocol: IProtocol): Promise<IProtocol>;
  getDataSourceDescription(): Promise<JSX.Element>;
}
export abstract class ImplementationModelBase implements ImplementationModel {
  abstract extractProtocolReferences(
    protocol: IProtocol,
  ): Promise<ImplementationProtocolReferences>;

  // Return a protocol with only the commands, events, and types that are
  // (directly or transitively) referenced by this implementation.
  async filterProtocol(protocol: IProtocol): Promise<IProtocol> {
    const references = await this.extractProtocolReferences(protocol);
    const protocolModel = new ProtocolModel(protocol);
    const requiredCommands = new Set<string>();
    const requiredEvents = new Set<string>();
    const requiredTypes = new Set<string>();

    for (const domain of protocol.domains) {
      for (const command of domain.commands ?? []) {
        const key = `${domain.domain}.${command.name}`;
        if (references.commands[key]?.length) {
          requiredCommands.add(key);
        }
      }
      for (const event of domain.events ?? []) {
        const key = `${domain.domain}.${event.name}`;
        if (references.events[key]?.length) {
          requiredEvents.add(key);
        }
      }
      for (const type of domain.types ?? []) {
        const key = `${domain.domain}.${type.id}`;
        if (references.types[key]?.length) {
          requiredTypes.add(key);
        }
      }
    }
    return protocolModel.filterProtocol({
      refs: [
        ...[...requiredCommands].map((name) => ({
          $ref: name,
          kind: 'command' as const,
        })),
        ...[...requiredEvents].map((name) => ({
          $ref: name,
          kind: 'event' as const,
        })),
        ...[...requiredTypes].map((name) => ({
          $ref: name,
          kind: 'type' as const,
        })),
      ] as const,
    });
  }

  getDataSourceDescription(): Promise<JSX.Element> {
    return Promise.resolve(<></>);
  }
}
