import { devToolsProtocolsByVersionSlug } from '@/data/protocols';
import { redirect } from 'next/navigation';

export default async function Page({
  params: { version },
}: {
  params: {
    version: string;
  };
}) {
  const protocol = devToolsProtocolsByVersionSlug.get(version)!;
  const resolvedProtocol = await (typeof protocol.protocol === 'function'
    ? protocol.protocol()
    : protocol.protocol);
  const firstDomain = resolvedProtocol.domains[0];
  if (!firstDomain) {
    throw new Error(`No domains found in protocol ${version}`);
  }
  return redirect(
    `/devtools-protocol/${encodeURIComponent(version)}/${encodeURIComponent(
      firstDomain.domain,
    )}`,
  );
}
