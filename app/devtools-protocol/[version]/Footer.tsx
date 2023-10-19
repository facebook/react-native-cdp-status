import { ExternalLink } from '@/ui/components/ExternalLink';

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-200 text-sm p-4 flex justify-between">
      <p className="flex space-x-1">
        <ExternalLink href="https://github.com/ChromeDevTools/devtools-logo">
          Chrome DevTools logo
        </ExternalLink>
        <span>used under a</span>
        <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
          CC BY 4.0
        </ExternalLink>
        <span>license.</span>
      </p>
      <p className="font-bold">
        Copyright ©  Meta Platforms, Inc
      </p>
      <p className="flex space-x-2">
        <ExternalLink href="https://opensource.fb.com/legal/terms">
          Terms of Use
        </ExternalLink>
        <ExternalLink href="https://opensource.fb.com/legal/privacy">
          Privacy Policy
        </ExternalLink>
      </p>
    </footer>
  );
}
