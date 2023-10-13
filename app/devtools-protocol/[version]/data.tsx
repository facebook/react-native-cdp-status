import { ImplementationProtocolReferences } from '@/data/ImplementationModel';
import { implementationModelsById } from '@/data/implementations';
import { IProtocol } from '@/third-party/protocol-schema';
import { ReactNode } from 'react';

export type ProtocolImplementationData = {
  referencesByImplementationId: ReadonlyMap<
    string,
    Readonly<{
      references: ImplementationProtocolReferences;
      dataSourceDescription: ReactNode;
    }>
  >;
};

export async function getProtocolImplementationData(
  protocol: IProtocol | (() => Promise<IProtocol>),
): Promise<ProtocolImplementationData> {
  const resolvedProtocol = await (typeof protocol === 'function'
    ? protocol()
    : protocol);
  const referencesByImplementationId = new Map(
    await Promise.all(
      [...implementationModelsById.entries()].map(
        async ([implementationId, implementationModel]) =>
          [
            implementationId,
            {
              references:
                await implementationModel.extractProtocolReferences(
                  resolvedProtocol,
                ),
              dataSourceDescription:
                await implementationModel.getDataSourceDescription(),
            },
          ] as const,
      ),
    ),
  );
  const protocolImplementationData: ProtocolImplementationData = {
    referencesByImplementationId,
  };
  return protocolImplementationData;
}
