import { devToolsProtocolsByVersionSlug } from '@/data/protocols';
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
  const protocol = devToolsProtocolsByVersionSlug.get(version);
  if (!protocol) {
    return notFound();
  }
  const resolvedProtocol = await (typeof protocol.protocol === 'function'
    ? protocol.protocol()
    : protocol.protocol);
  return (
    <div>
      <div className="flex">
        <nav className="bg-gray-100 dark:bg-gray-900 w-64 flex-shrink-0">
          <h2 className="font-bold text-lg p-4">Versions</h2>
          <ul className="p-0 list-inside">
            {Array.from(devToolsProtocolsByVersionSlug.values()).map(
              ({ metadata: { versionName, versionSlug } }) => (
                <li key={versionSlug} className="flex flex-col">
                  <Link
                    href={`/devtools-protocol/${versionSlug}`}
                    className="text-blue-600 hover:underline py-1 pl-8 hover:bg-stone-200"
                  >
                    {versionName}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <h2 className="font-bold text-lg p-4">Domains</h2>
          <ul className="p-0">
            {resolvedProtocol.domains.map((domain) => (
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
