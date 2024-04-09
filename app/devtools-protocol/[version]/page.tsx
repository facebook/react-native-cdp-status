/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { protocolVersionsModel } from '@/data/protocols';
import { Card } from '@/ui/components/Card';
import { getProtocolImplementationData } from './data';
import { Markdown } from '@/ui/components/Markdown';
import { notFound } from 'next/navigation';
import { implementationModelsById } from '@/data/implementations';
import { DataSourceDescription } from './DataSourceDescription';
import { ProtocolVersionExternalLinks } from './ProtocolVersionExternalLinks';
import {
  ImplementationStatsHeader,
  ImplementationStats,
} from './ImplementationStats';
import { ImplementationDataSourceDescription } from './ImplementationDataSourceDescription';

export default async function ProtocolVersionPage({
  params: { version },
}: {
  params: {
    version: string;
  };
}) {
  const protocolVersion =
    await protocolVersionsModel.protocolVersionBySlug(version);
  if (!protocolVersion) {
    return notFound();
  }
  const protocol = await protocolVersion.protocol();
  const metadata = await protocolVersion.metadata();
  const protocolImplementationData = await getProtocolImplementationData(
    protocol.protocol,
  );

  return (
    <main className="p-4 flex-grow">
      <Card
        title={'Protocol version ' + metadata.versionName}
        topContent={
          <ProtocolVersionExternalLinks protocolMetadata={metadata} />
        }
      >
        <Markdown className="mb-2">{metadata.description}</Markdown>
        <DataSourceDescription name="Protocol" {...metadata.dataSource} />
        <ImplementationDataSourceDescription
          implementation={implementationModelsById.get('hermes')!}
        />
        <ImplementationDataSourceDescription
          implementation={implementationModelsById.get('react-native')!}
        />
        <ImplementationStatsHeader />
        <ImplementationStats
          implementationId="hermes"
          implementation={implementationModelsById.get('hermes')!}
          protocol={protocol.protocol}
          protocolImplementationData={protocolImplementationData}
        />
        <ImplementationStats
          implementationId="hermes-legacy"
          implementation={implementationModelsById.get('hermes-legacy')!}
          protocol={protocol.protocol}
          protocolImplementationData={protocolImplementationData}
        />
        <ImplementationStats
          implementationId="react-native-hermes"
          implementation={implementationModelsById.get('react-native-hermes')!}
          protocol={protocol.protocol}
          protocolImplementationData={protocolImplementationData}
        />
      </Card>
    </main>
  );
}

export async function generateStaticParams() {
  const params = [];
  for (const protocol of Array.from(
    await protocolVersionsModel.protocolVersions(),
  )) {
    const { versionSlug } = await protocol.metadata();
    params.push({
      version: versionSlug,
    });
  }
  return params;
}
