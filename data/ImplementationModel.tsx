/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IProtocol, Protocol } from '@/third-party/protocol-schema';
import { ProtocolModel } from './ProtocolModel';

type ReferenceLocation = {
  match: string;
  index: number;
  length: number;
  // 1-based
  line: number;
  // 1-based
  column: number;
  github?: {
    owner: string;
    repo: string;
    commitSha: string;
    path: string;
  };
};

export type ImplementationProtocolReferences = {
  commands: Record<string, ReferenceLocation[]>;
  events: Record<string, ReferenceLocation[]>;
  types: Record<string, ReferenceLocation[]>;
};

export type DataSourceMetadata = {
  github?: {
    owner: string;
    repo: string;
    commitSha: string;
  };
};

export interface ImplementationModel {
  extractProtocolReferences(
    protocol: IProtocol,
  ): Promise<ImplementationProtocolReferences>;
  filterProtocol(protocol: IProtocol): Promise<IProtocol>;
  getDataSourceMetadata(): Promise<DataSourceMetadata>;
  readonly displayName: string;
}
export abstract class ImplementationModelBase implements ImplementationModel {
  abstract readonly displayName: string;
  abstract extractProtocolReferences(
    protocol: IProtocol,
  ): Promise<ImplementationProtocolReferences>;

  async getDataSourceMetadata(): Promise<DataSourceMetadata> {
    return {};
  }

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
}
