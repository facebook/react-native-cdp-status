import DevToolsBrowserProtocol from 'devtools-protocol/json/browser_protocol.json';
import {
  ProtocolDomain,
  devToolsProtocolsByVersionSlug,
} from '@/data/protocols';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { Markdown } from '@/ui/components/Markdown';

export default async function Page({
  params: { version, domain: domainName },
}: {
  params: {
    version: string;
    domain: string;
  };
}) {
  const protocol = devToolsProtocolsByVersionSlug.get(version);
  if (!protocol) {
    return notFound();
  }
  const domain = protocol.protocol.domains.find((d) => d.domain === domainName);
  if (!domain) {
    return notFound();
  }
  return (
    <div className="flex">
      <nav className="bg-gray-100 w-64 flex-shrink-0">
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
          {protocol.protocol.domains.map((domain) => (
            <li key={domain.domain} className="flex flex-col">
              <Link
                className={`text-blue-600 hover:underline py-1 border-s-[16px] pl-4 hover:bg-stone-200 ${
                  domain.experimental
                    ? 'border-red-300'
                    : 'deprecated' in domain && domain.deprecated
                    ? 'border-orange-300'
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
      <main className="p-4 flex-grow">
        {<Domain domain={domain} versionSlug={version} />}
      </main>
    </div>
  );
}

function Card({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 my-4 max-w-4xl mx-auto">
      {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
      {children}
    </span>
  );
}

function ExperimentalOrDeprecatedTag({
  for: for_,
}: {
  for: { experimental?: boolean; deprecated?: boolean; [key: string]: any };
}) {
  if ('experimental' in for_ && for_.experimental) {
    return (
      <span className="bg-red-300 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
        Experimental
      </span>
    );
  }
  if ('deprecated' in for_ && for_.deprecated) {
    return (
      <span className="bg-orange-300 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
        Deprecated
      </span>
    );
  }
  return <></>;
}

async function Domain({
  domain,
  versionSlug,
}: {
  domain: ProtocolDomain;
  versionSlug: string;
}) {
  return (
    <>
      <Card title={`${domain.domain} Domain`}>
        {'description' in domain && domain.description && (
          <Markdown>{domain.description}</Markdown>
        )}
        <ExperimentalOrDeprecatedTag for={domain} />
        <h3 className="font-bold text-lg mt-4 mb-2">Methods</h3>
        <ul>
          {
            // Each method is a separate card on this page. Link to them using fragments.
            domain.commands.map((command) => (
              <li key={command.name}>
                <Link
                  href={`#method-${encodeURIComponent(command.name)}`}
                  className="text-blue-600 hover:underline font-mono"
                >
                  {domain.domain}.{command.name}
                </Link>{' '}
                <ExperimentalOrDeprecatedTag for={command} />
              </li>
            ))
          }
        </ul>
        {(domain.events?.length ?? 0) !== 0 && (
          <>
            <h3 className="font-bold text-lg mt-4 mb-2">Events</h3>
            <ul>
              {
                // Each event is a separate card on this page. Link to them using fragments.
                domain.events!.map((event) => (
                  <li key={event.name}>
                    <Link
                      href={`#event-${encodeURIComponent(event.name)}`}
                      className="text-blue-600 hover:underline font-mono"
                    >
                      {domain.domain}.{event.name}
                    </Link>{' '}
                    <ExperimentalOrDeprecatedTag for={event} />
                  </li>
                ))
              }
            </ul>
          </>
        )}
        {(domain.types?.length ?? 0) !== 0 && (
          <>
            <h3 className="font-bold text-lg mt-4 mb-2">Types</h3>
            <ul>
              {
                // Each type is a separate card on this page. Link to them using fragments.
                domain.types!.map((type) => (
                  <li key={type.id}>
                    <Link
                      href={`#type-${encodeURIComponent(type.id)}`}
                      className="text-blue-600 hover:underline font-mono"
                    >
                      {domain.domain}.{type.id}
                    </Link>{' '}
                    <ExperimentalOrDeprecatedTag for={type} />
                  </li>
                ))
              }
            </ul>
          </>
        )}
      </Card>
      <h2
        className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto"
        id="methods"
      >
        Methods
      </h2>
      <Card>
        {domain.commands.map((command, index) => (
          <React.Fragment key={command.name}>
            {/* add horizontal separator if not the first item */}
            {index > 0 && <hr className="my-4" />}
            <h3
              className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto font-mono"
              id={`method-${encodeURIComponent(command.name)}`}
            >
              {domain.domain}.{command.name}{' '}
              <ExperimentalOrDeprecatedTag for={command} />
            </h3>
            {'description' in command && command.description && (
              <Markdown>{command.description}</Markdown>
            )}
            {'parameters' in command && command.parameters && (
              <>
                <h4 className="font-bold text-lg mt-4 mb-2">Parameters</h4>
                <PropsTable
                  items={command.parameters as any}
                  domain={domain.domain}
                  versionSlug={versionSlug}
                />
              </>
            )}
            {'returns' in command &&
              command.returns != null &&
              command.returns.length !== 0 && (
                <>
                  <h4 className="font-bold text-lg mt-4 mb-2">Return object</h4>
                  <PropsTable
                    items={command.returns as any}
                    domain={domain.domain}
                    versionSlug={versionSlug}
                  />
                </>
              )}
          </React.Fragment>
        ))}
      </Card>
      {domain.events != null && domain.events?.length !== 0 && (
        <>
          <h2
            className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto"
            id="events"
          >
            Events
          </h2>
          <Card>
            {domain.events.map((event, index) => (
              <React.Fragment key={event.name}>
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <h3
                  className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto font-mono"
                  id={`event-${encodeURIComponent(event.name)}`}
                >
                  {domain.domain}.{event.name}{' '}
                  <ExperimentalOrDeprecatedTag for={event} />
                </h3>
                {'description' in event && event.description && (
                  <Markdown>{event.description}</Markdown>
                )}
                {'parameters' in event && event.parameters && (
                  <>
                    <h4 className="font-bold text-lg mt-4 mb-2">Parameters</h4>
                    <PropsTable
                      items={event.parameters as any}
                      domain={domain.domain}
                      versionSlug={versionSlug}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
          </Card>
        </>
      )}
      {domain.types != null && domain.types.length !== 0 && (
        <>
          <h2
            className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto"
            id="types"
          >
            Types
          </h2>
          <Card>
            {domain.types.map((type, index) => (
              <React.Fragment key={type.id}>
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <h3
                  className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto font-mono"
                  id={`type-${encodeURIComponent(type.id)}`}
                >
                  {domain.domain}.{type.id}{' '}
                  <ExperimentalOrDeprecatedTag for={type} />
                </h3>
                {'description' in type && type.description && (
                  <Markdown>{type.description}</Markdown>
                )}
                {'properties' in type && type.properties && (
                  <>
                    <h4 className="font-bold text-lg mt-4 mb-2">Properties</h4>
                    <PropsTable
                      items={type.properties as any}
                      domain={domain.domain}
                      versionSlug={versionSlug}
                    />
                  </>
                )}
              </React.Fragment>
            ))}
          </Card>
        </>
      )}
    </>
  );
}

type Type =
  | {
      type: 'array';
      items: Type;
    }
  | {
      type: 'boolean' | 'integer' | 'string' | 'number' | 'object' | 'any';
    }
  | {
      type?: undefined;
      $ref: string;
    };

function TypeLink({
  type,
  domain,
  versionSlug,
}: {
  type: Type | undefined;
  domain: string;
  versionSlug: string;
}) {
  if (!type) {
    return <></>;
  }
  switch (type.type) {
    case 'array':
      return (
        <code className="font-mono font-bold">
          array[{' '}
          <TypeLink
            type={type.items}
            domain={domain}
            versionSlug={versionSlug}
          />{' '}
          ]
        </code>
      );
    case 'object':
    case 'boolean':
    case 'integer':
    case 'string':
    case 'number':
    case 'any':
      return <code className="font-mono font-bold">{type.type}</code>;

    case undefined: {
      const { $ref } = type;
      const { domain: resolvedDomain, localName } = resolveMaybeQualifiedRef({
        $ref,
        domain,
      });
      return (
        <Link
          href={`/devtools-protocol/${encodeURIComponent(
            versionSlug,
          )}/${encodeURIComponent(resolvedDomain)}#type-${encodeURIComponent(
            localName,
          )}`}
          className="text-blue-600 hover:underline font-mono font-bold"
        >
          {$ref}
        </Link>
      );
    }
    default: {
      throw new Error(`Unhandled type: ${JSON.stringify(type)}`);
    }
  }
}

function resolveMaybeQualifiedRef({
  $ref,
  domain,
}: {
  $ref: string;
  domain: string;
}) {
  if ($ref.includes('.')) {
    const [qualifiedDomain, ...rest] = $ref.split('.');
    const localName = rest.join('.');
    return { domain: qualifiedDomain, localName };
  }
  return { domain, localName: $ref };
}

function PropsTable({
  items,
  domain,
  versionSlug,
}: {
  items: Array<
    {
      name: string;
      optional?: boolean;
      description?: string;
    } & Type
  >;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {items.map((item) => (
        <React.Fragment key={item.name}>
          <div className="flex flex-row">
            <div className="w-2/5 text-end me-4 mb-4">
              <code className="font-mono">{item.name}</code>
              {'optional' in item && item.optional && (
                <>
                  <br />
                  <Tag>Optional</Tag>
                </>
              )}{' '}
            </div>
            <div className="w-3/5 mb-4">
              <TypeLink domain={domain} type={item} versionSlug={versionSlug} />
              {'description' in item && item.description && (
                <Markdown>{item.description}</Markdown>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

export async function generateStaticParams() {
  const params = [];
  for (const protocol of Array.from(devToolsProtocolsByVersionSlug.values())) {
    for (const domain of protocol.protocol.domains) {
      params.push({
        version: protocol.metadata.versionSlug,
        domain: domain.domain,
      });
    }
  }
  return params;
}
