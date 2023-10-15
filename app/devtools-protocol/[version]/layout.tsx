import { protocolVersionsModel } from '@/data/protocols';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from './Footer';
import { ProtocolVersionModel } from '@/data/ProtocolVersionModel';
import { ProtocolDomainNavItem } from './layout-client';

export default async function Layout({
  params: { version },
  children,
}: {
  params: {
    version: string;
  };
  children: React.ReactNode;
}) {
  const protocolVersion =
    await protocolVersionsModel.protocolVersionBySlug(version);
  if (!protocolVersion) {
    return notFound();
  }
  const protocolVersions = await protocolVersionsModel.protocolVersions();
  const protocol = await protocolVersion.protocol();
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-grow">
        <nav className="bg-gray-100 dark:bg-gray-900 w-64 flex-shrink-0">
          <h2 className="font-bold text-lg p-4">Versions</h2>
          <ul className="p-0 list-inside">
            {protocolVersions.map((protocolVersion, i) => (
              <ProtocolVersionNavItem
                key={protocolVersion.versionSlug}
                currentVersionSlug={version}
                protocolVersion={protocolVersion}
              />
            ))}
          </ul>
          <h2 className="font-bold text-lg p-4">Domains</h2>
          <ul className="p-0">
            {protocol.protocol.domains.map((domain) => (
              <ProtocolDomainNavItem
                key={domain.domain}
                domain={domain}
                versionSlug={protocolVersion.versionSlug}
              />
            ))}
          </ul>
        </nav>
        {children}
      </div>
      <Footer />
    </div>
  );
}

async function ProtocolVersionNavItem({
  protocolVersion,
  currentVersionSlug,
}: {
  protocolVersion: ProtocolVersionModel;
  currentVersionSlug: string;
}) {
  const { versionName, versionSlug } = await protocolVersion.metadata();

  return (
    <li className="flex flex-col">
      <Link
        href={`/devtools-protocol/${versionSlug}`}
        className={
          'text-blue-600 hover:underline py-1 pl-8 hover:bg-stone-200' +
          (currentVersionSlug === versionSlug ? ' font-bold' : '')
        }
      >
        {versionName}
      </Link>
    </li>
  );
}
