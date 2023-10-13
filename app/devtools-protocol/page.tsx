import { protocolVersionsModel } from '@/data/protocols';
import { redirect } from 'next/navigation';

export default async function Page() {
  const protocolVersions = await protocolVersionsModel.protocolVersions();
  const { versionSlug: firstVersionSlug } =
    await protocolVersions[0].metadata();
  return redirect(`/devtools-protocol/${encodeURIComponent(firstVersionSlug)}`);
}
