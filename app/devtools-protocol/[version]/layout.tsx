import { protocolVersionsModel } from '@/data/protocols';
import { ExternalLink } from '@/ui/components/ExternalLink';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
            {await Promise.all(
              protocolVersions.map(async (protocolVersion) => {
                const { versionName, versionSlug } =
                  await protocolVersion.metadata();
                return (
                  <li key={versionSlug} className="flex flex-col">
                    <Link
                      href={`/devtools-protocol/${versionSlug}`}
                      className="text-blue-600 hover:underline py-1 pl-8 hover:bg-stone-200"
                    >
                      {versionName}
                    </Link>
                  </li>
                );
              }),
            )}
          </ul>
          <h2 className="font-bold text-lg p-4">Domains</h2>
          <ul className="p-0">
            {protocol.protocol.domains.map((domain) => (
              <li key={domain.domain} className="flex flex-col">
                <Link
                  className={`text-blue-600 hover:underline py-1 border-s-[16px] pl-4 hover:bg-stone-200 ${
                    domain.experimental
                      ? 'border-red-300 dark:border-red-500'
                      : 'deprecated' in domain && domain.deprecated
                      ? 'border-orange-300 dark:border-orange-500'
                      : 'border-transparent'
                  }`}
                  href={`/devtools-protocol/${encodeURIComponent(
                    version,
                  )}/${encodeURIComponent(domain.domain)}`}
                >
                  {domain.domain}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </div>
      <footer className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-sm p-4 flex-shrink-0">
        <ExternalLink href="https://github.com/ChromeDevTools/devtools-logo">
          Chrome DevTools logo
        </ExternalLink>{' '}
        used under a{' '}
        <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0
        </ExternalLink>{' '}
        license.
      </footer>
    </div>
  );
}
