import DevToolsBrowserProtocol from 'devtools-protocol/json/browser_protocol.json';
import { devToolsProtocolsByVersionSlug } from '@/data/protocols';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { remark } from 'remark';
import html from 'remark-html';

export default async function Page({
  params: { version, domain },
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
  return (
    <div className="flex">
      <nav className="bg-gray-100 w-64 flex-shrink-0">
        <h2 className="font-bold text-lg p-4">Versions</h2>
        <ul className="p-4 list-inside">
          {Array.from(devToolsProtocolsByVersionSlug.values()).map(
            ({ metadata: { versionSlug }, protocol: { version } }) => (
              <li key={versionSlug} className="mb-2 list-disc">
                <Link
                  href={`/devtools-protocol/${versionSlug}`}
                  className="text-blue-600 hover:underline"
                >
                  {version.major}.{version.minor}
                </Link>
              </li>
            ),
          )}
        </ul>
        <h2 className="font-bold text-lg p-4">Domains</h2>
        <ul className="p-4">
          {protocol.protocol.domains.map((domain) => (
            <li key={domain.domain} className="mb-2">
              <Link
                className="text-blue-600 hover:underline"
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
        {
          <Domain
            domain={protocol.protocol.domains.find((d) => d.domain === domain)!}
            versionSlug={version}
          />
        }
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
    <span className="bg-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700">
      {children}
    </span>
  );
}

async function Domain({
  domain,
  versionSlug,
}: {
  domain: (typeof DevToolsBrowserProtocol)['domains'][0];
  versionSlug: string;
}) {
  return (
    <>
      <Card title={`${domain.domain} Domain`}>
        {'description' in domain && domain.description && (
          <Markdown>{domain.description}</Markdown>
        )}
        {domain.experimental && <Tag>Experimental</Tag>}
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
                </Link>
                {'experimental' in command && command.experimental && (
                  <>
                    {' '}
                    <Tag>Experimental</Tag>
                  </>
                )}
              </li>
            ))
          }
        </ul>
        {domain.events && (
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
                    </Link>
                    {'experimental' in event && event.experimental && (
                      <>
                        {' '}
                        <Tag>Experimental</Tag>
                      </>
                    )}
                  </li>
                ))
              }
            </ul>
          </>
        )}
        {domain.types && (
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
                    </Link>
                    {'experimental' in type && type.experimental && (
                      <>
                        {' '}
                        <Tag>Experimental</Tag>
                      </>
                    )}
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
              {domain.domain}.{command.name}
              {'experimental' in command && command.experimental && (
                <>
                  {' '}
                  <Tag>Experimental</Tag>
                </>
              )}
            </h3>
            {'description' in command && command.description && (
              <Markdown>{command.description}</Markdown>
            )}
            {'parameters' in command && command.parameters && (
              <>
                <h4 className="font-bold text-lg mt-4 mb-2">Parameters</h4>
                {command.parameters.map((parameter) => (
                  <React.Fragment key={parameter.name}>
                    <div className="flex flex-row">
                      <div className="w-1/4">
                        <code className="font-mono">{parameter.name}</code>
                        {'optional' in parameter && parameter.optional && (
                          <>
                            {' '}
                            <Tag>Optional</Tag>
                          </>
                        )}{' '}
                      </div>
                      <div className="w-1/4">
                        <TypeLink
                          type={parameter as any}
                          versionSlug={versionSlug}
                        />
                      </div>
                      <div className="w-2/4">
                        {'description' in parameter &&
                          parameter.description && (
                            <Markdown>{parameter.description}</Markdown>
                          )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
            {'returns' in command && command.returns?.length && (
              <>
                <h4 className="font-bold text-lg mt-4 mb-2">Return object</h4>
                {command.returns.map((prop) => (
                  <React.Fragment key={prop.name}>
                    <div className="flex flex-row">
                      <div className="w-1/4">
                        <code className="font-mono">{prop.name}</code>
                      </div>
                      <div className="w-1/4">
                        <TypeLink
                          type={prop as any}
                          versionSlug={versionSlug}
                        />
                      </div>
                      <div className="w-3/4">
                        {'description' in prop && prop.description && (
                          <Markdown>{prop.description}</Markdown>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </>
            )}
          </React.Fragment>
        ))}
      </Card>
    </>
  );
}

type Type =
  | {
      type: 'array';
      items: Type;
    }
  | {
      type: 'boolean' | 'integer' | 'string' | 'number';
    }
  | {
      type: 'object';
      properties: {};
    }
  | {
      type?: void;
      $ref: string;
    };

function TypeLink({
  type,
  versionSlug,
}: {
  type: Type | void;
  versionSlug: string;
}) {
  if (!type) {
    return <></>;
  }
  switch (type.type) {
    case 'array':
      return (
        <code className="font-mono">
          array[ <TypeLink type={type.items} versionSlug={versionSlug} /> ]
        </code>
      );
    case 'boolean':
    case 'integer':
    case 'string':
    case 'number':
      return <code className="font-mono">{type.type}</code>;

    case undefined: {
      const { $ref } = type;
      const [domain, ...rest] = $ref.split('.');
      const typeName = rest.join('.');
      return (
        <Link
          href={`/devtools-protocol/${encodeURIComponent(
            versionSlug,
          )}/${encodeURIComponent(domain)}#type-${encodeURIComponent(
            typeName,
          )}`}
          className="text-blue-600 hover:underline font-mono"
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

async function Markdown({ children }: { children: string }) {
  const htmlString = await remark().use(html).process(children);
  return <div dangerouslySetInnerHTML={{ __html: htmlString.toString() }} />;
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
