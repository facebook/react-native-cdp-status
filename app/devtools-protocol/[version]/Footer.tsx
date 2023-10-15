import { ExternalLink } from '@/ui/components/ExternalLink';

export function Footer() {
  return (
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
  );
}
