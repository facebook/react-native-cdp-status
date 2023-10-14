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
