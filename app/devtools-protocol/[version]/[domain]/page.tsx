import {
  ProtocolDomain,
  devToolsProtocolsByVersionSlug,
} from '@/data/protocols';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { Markdown } from '@/ui/components/Markdown';
import { CopyableAnchor } from '@/ui/components/CopyableAnchor';
import { DimText } from '@/ui/components/DimText';
import Image from 'next/image';
import { ExternalLink } from '@/ui/components/ExternalLink';
import { implementationModelsById } from '@/data/implementations';
import { Protocol } from '@/third-party/protocol-schema';
import { ImplementationProtocolReferences } from '@/data/ImplementationModel';
import { resolveMaybeQualifiedRef } from '@/data/ProtocolModel';

type ProtocolImplementationData = {
  referencesByImplementationId: ReadonlyMap<
    string,
    Readonly<{ references: ImplementationProtocolReferences }>
  >;
};

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
  const resolvedProtocol = await (typeof protocol.protocol === 'function'
    ? protocol.protocol()
    : protocol.protocol);
  const domain = resolvedProtocol.domains.find((d) => d.domain === domainName);
  if (!domain) {
    return notFound();
  }
  const referencesByImplementationId = new Map(
    await Promise.all(
      [...implementationModelsById.entries()].map(
        async ([implementationId, implementationModel]) =>
          [
            implementationId,
            {
              references:
                await implementationModel.extractProtocolReferences(
                  resolvedProtocol,
                ),
            },
          ] as const,
      ),
    ),
  );
  const protocolImplementationData: ProtocolImplementationData = {
    referencesByImplementationId,
  };
  return (
    <div>
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
            {resolvedProtocol.domains.map((domain) => (
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
          {
            <Domain
              domain={domain}
              versionSlug={version}
              protocolImplementationData={protocolImplementationData}
            />
          }
        </main>
      </div>
      <footer className="bg-gray-100 text-gray-600 text-sm p-4 flex-shrink-0">
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

function Card({
  title,
  children,
  topContent,
}: {
  title?: string;
  children?: ReactNode;
  topContent?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 my-4 max-w-4xl mx-auto">
      {topContent}
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

function FeatureStatusTags({ for: for_ }: { for: Protocol.Feature }) {
  return (
    <>
      {'experimental' in for_ && for_.experimental && (
        <span className="bg-red-300 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
          Experimental
        </span>
      )}
      {'deprecated' in for_ && for_.deprecated && (
        <span className="bg-orange-300 rounded-lg px-2 py-1 text-sm text-gray-700 font-sans font-normal">
          Deprecated
        </span>
      )}
    </>
  );
}

async function Domain({
  domain,
  versionSlug,
  protocolImplementationData,
}: {
  domain: ProtocolDomain;
  versionSlug: string;
  protocolImplementationData: ProtocolImplementationData;
}) {
  return (
    <>
      <TocCard
        domain={domain}
        versionSlug={versionSlug}
        protocolImplementationData={protocolImplementationData}
      />
      {domain.commands != null && domain.commands?.length !== 0 && (
        <>
          <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
            Methods
          </h2>
          <Card>
            {domain.commands.map((command, index) => (
              <div key={command.name} className="group">
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <MemberHeading
                  kind="method"
                  versionSlug={versionSlug}
                  member={command}
                  domain={domain.domain}
                  protocolImplementationData={protocolImplementationData}
                />
                <MemberDescription member={command} />
                <MemberParameters
                  member={command}
                  domain={domain.domain}
                  versionSlug={versionSlug}
                />
                <MethodReturnObject
                  command={command}
                  domain={domain.domain}
                  versionSlug={versionSlug}
                />
              </div>
            ))}
          </Card>
        </>
      )}
      {domain.events != null && domain.events?.length !== 0 && (
        <>
          <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
            Events
          </h2>
          <Card>
            {domain.events.map((event, index) => (
              <div key={event.name} className="group">
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <MemberHeading
                  kind="event"
                  versionSlug={versionSlug}
                  member={event}
                  domain={domain.domain}
                  protocolImplementationData={protocolImplementationData}
                />
                <MemberDescription member={event} />
                <MemberParameters
                  member={event}
                  domain={domain.domain}
                  versionSlug={versionSlug}
                />
              </div>
            ))}
          </Card>
        </>
      )}
      {domain.types != null && domain.types.length !== 0 && (
        <>
          <h2 className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto">
            Types
          </h2>
          <Card>
            {domain.types.map((type, index) => (
              <div key={type.id} className="group">
                {/* add horizontal separator if not the first item */}
                {index > 0 && <hr className="my-4" />}
                <MemberHeading
                  kind="type"
                  versionSlug={versionSlug}
                  member={type}
                  domain={domain.domain}
                  protocolImplementationData={protocolImplementationData}
                />
                <MemberDescription member={type} />
                <p>
                  Type:{' '}
                  <TypeLink
                    type={type}
                    domain={domain.domain}
                    versionSlug={versionSlug}
                  />
                </p>
                <TypeDetail type={type} />
                <TypeProperties
                  type={type}
                  domain={domain.domain}
                  versionSlug={versionSlug}
                />
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}

function TocCard({
  domain,
  versionSlug,
  protocolImplementationData,
}: {
  domain: ProtocolDomain;
  versionSlug: string;
  protocolImplementationData: ProtocolImplementationData;
}) {
  return (
    <Card
      title={`${domain.domain} Domain`}
      topContent={
        <DomainExternalLinks domain={domain.domain} versionSlug={versionSlug} />
      }
    >
      {'description' in domain && domain.description && (
        <Markdown>{domain.description}</Markdown>
      )}
      <FeatureStatusTags for={domain} />
      <MemberLinks
        kind="method"
        members={domain.commands}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Methods
      </MemberLinks>
      <MemberLinks
        kind="event"
        members={domain.events}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Events
      </MemberLinks>
      <MemberLinks
        kind="type"
        members={domain.types}
        domain={domain.domain}
        protocolImplementationData={protocolImplementationData}
      >
        Types
      </MemberLinks>
    </Card>
  );
}

function TypeLink({
  type,
  domain,
  versionSlug,
  failIfEnum,
}: {
  type: Protocol.ProtocolType | undefined;
  domain: string;
  versionSlug: string;
  failIfEnum?: boolean;
}) {
  if (!type) {
    return <></>;
  }
  if (failIfEnum && 'enum' in type && type.enum) {
    throw new Error(`Unexpected enum in this context: ${JSON.stringify(type)}`);
  }
  if ('$ref' in type) {
    {
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
            failIfEnum
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
    default: {
      throw new Error(`Unhandled type: ${JSON.stringify(type as never)}`);
    }
  }
}

function TypeDetail({ type }: { type: Protocol.ProtocolType }) {
  if (!type) {
    return <></>;
  }
  if ('$ref' in type) {
    return <></>;
  }
  switch (type.type) {
    case 'string':
      if (type.enum) {
        return (
          <>
            <p>
              Allowed values:{' '}
              {type.enum.map((value, index) => (
                <React.Fragment key={value}>
                  {index > 0 && ', '}
                  <code className="font-mono">{value}</code>
                </React.Fragment>
              ))}
            </p>
          </>
        );
      }
      return <></>;
    case 'array':
    case 'object':
    case 'boolean':
    case 'integer':
    case 'number':
    case 'any':
      return <></>;
    default: {
      throw new Error(`Unhandled type: ${JSON.stringify(type as never)}`);
    }
  }
}

function PropsTable({
  items,
  domain,
  versionSlug,
}: {
  items: Array<Protocol.PropertyType>;
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
              <TypeDetail type={item} />
              <FeatureStatusTags for={item} />
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function MemberLinks({
  kind,
  members,
  domain,
  children,
  protocolImplementationData,
}: {
  kind: 'method' | 'event' | 'type';
  members:
    | Array<
        {
          experimental?: boolean;
          deprecated?: boolean;
        } & ({ name: string } | { id: string })
      >
    | undefined;
  domain: string;
  children: ReactNode;
  protocolImplementationData: ProtocolImplementationData;
}) {
  return (
    members != null &&
    members.length !== 0 && (
      <>
        <h3 className="font-bold text-lg mt-4 mb-2">{children}</h3>
        <ul>
          {members.map((member) => {
            const key = 'name' in member ? member.name : member.id;
            return (
              <li key={key}>
                <Link
                  href={`#${kind}-${encodeURIComponent(key)}`}
                  className="text-blue-600 hover:underline font-mono"
                >
                  <DimText>{domain}.</DimText>
                  {key}
                </Link>{' '}
                <FeatureStatusTags for={member} />
                <ImplementationLinkForMember
                  domain={domain}
                  implementationId="hermes"
                  kind={kind}
                  memberKey={key}
                  protocolImplementationData={protocolImplementationData}
                  small
                />
              </li>
            );
          })}
        </ul>
      </>
    )
  );
}

function MemberHeading({
  kind,
  member,
  domain,
  versionSlug,
  protocolImplementationData,
}: {
  kind: 'method' | 'event' | 'type';
  member: {
    experimental?: boolean;
    deprecated?: boolean;
  } & ({ name: string } | { id: string });
  domain: string;
  versionSlug: string;
  protocolImplementationData: ProtocolImplementationData;
}) {
  const key = 'name' in member ? member.name : member.id;
  return (
    <>
      <MemberExternalLinks
        kind={kind}
        memberKey={key}
        domain={domain}
        versionSlug={versionSlug}
        protocolImplementationData={protocolImplementationData}
      />
      <h3
        className="font-bold text-lg mt-4 mb-2 max-w-4xl mx-auto font-mono"
        id={`${kind}-${encodeURIComponent(key)}`}
      >
        <DimText>{domain}.</DimText>
        {key} <FeatureStatusTags for={member} />
        <CopyableAnchor href={`#${kind}-${encodeURIComponent(key)}`} />
      </h3>
    </>
  );
}

function DomainExternalLinks({
  domain,
  versionSlug,
}: {
  domain: string;
  versionSlug: string;
}) {
  const cdpUrl = `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
    versionSlug,
  )}/${encodeURIComponent(domain)}`;
  return (
    <div className="float-right">
      <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
        <Image
          src="/images/chrome-devtools-circle-responsive.svg"
          width={24}
          height={24}
          alt="Chrome DevTools"
          about=""
        />
      </a>
    </div>
  );
}

function ImplementationLinkForMember({
  implementationId,
  kind,
  domain,
  memberKey,
  protocolImplementationData,
  small,
}: {
  implementationId: 'hermes';
  kind: 'method' | 'event' | 'type';
  domain: string;
  memberKey: string;
  protocolImplementationData: ProtocolImplementationData;
  small?: boolean;
}) {
  const isImplemented =
    (protocolImplementationData.referencesByImplementationId.get(
      implementationId,
    )?.references[
      kind === 'type' ? 'types' : kind === 'method' ? 'commands' : 'events'
    ]?.[domain + '.' + memberKey]?.length ?? 0) !== 0;
  switch (implementationId) {
    case 'hermes': {
      return isImplemented ? (
        <Image
          src="/images/hermes-logo.svg"
          width={small ? 20 : 24}
          height={small ? 20 : 24}
          alt="Hermes"
          title="Implemented in Hermes CDPHandler"
          className="inline-block"
        />
      ) : (
        <></>
      );
    }
    default:
      throw new Error(`Unhandled implementationId: ${implementationId}`);
  }
}

function MemberExternalLinks({
  kind,
  memberKey,
  versionSlug,
  domain,
  protocolImplementationData,
}: {
  kind: 'method' | 'event' | 'type';
  memberKey: string;
  versionSlug: string;
  domain: string;
  protocolImplementationData: ProtocolImplementationData;
}) {
  const cdpUrl = `https://chromedevtools.github.io/devtools-protocol/${encodeURIComponent(
    versionSlug,
  )}/${encodeURIComponent(domain)}#${encodeURIComponent(
    kind,
  )}-${encodeURIComponent(memberKey)}`;

  return (
    <div className="float-right flex-row gap-1 flex">
      <ImplementationLinkForMember
        domain={domain}
        implementationId="hermes"
        kind={kind}
        memberKey={memberKey}
        protocolImplementationData={protocolImplementationData}
      />
      <a href={cdpUrl} target="cdp-reference" title="View in CDP docs">
        <Image
          src="/images/chrome-devtools-circle-responsive.svg"
          width={24}
          height={24}
          alt="Chrome DevTools"
          className="inline-block"
        />
      </a>
    </div>
  );
}

function MemberDescription({
  member,
}: {
  member: {
    description?: string;
  };
}) {
  return (
    <>
      {'description' in member && member.description && (
        <Markdown>{member.description}</Markdown>
      )}
    </>
  );
}

function MemberParameters({
  member,
  domain,
  versionSlug,
}: {
  member: Protocol.Event | Protocol.Command;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'parameters' in member && member.parameters && (
        <>
          <h4 className="font-bold text-lg mt-4 mb-2">Parameters</h4>
          <PropsTable
            items={member.parameters}
            domain={domain}
            versionSlug={versionSlug}
          />
        </>
      )}
    </>
  );
}

function TypeProperties({
  type,
  domain,
  versionSlug,
}: {
  type: Protocol.ProtocolType;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'properties' in type && type.properties && (
        <>
          <h4 className="font-bold text-lg mt-4 mb-2">Properties</h4>
          <PropsTable
            items={type.properties}
            domain={domain}
            versionSlug={versionSlug}
          />
        </>
      )}
    </>
  );
}

function MethodReturnObject({
  command,
  domain,
  versionSlug,
}: {
  command: Protocol.Command;
  domain: string;
  versionSlug: string;
}) {
  return (
    <>
      {'returns' in command &&
        command.returns != null &&
        command.returns.length !== 0 && (
          <>
            <h4 className="font-bold text-lg mt-4 mb-2">Return object</h4>
            <PropsTable
              items={command.returns}
              domain={domain}
              versionSlug={versionSlug}
            />
          </>
        )}
    </>
  );
}

export async function generateStaticParams() {
  const params = [];
  for (const protocol of Array.from(devToolsProtocolsByVersionSlug.values())) {
    const resolvedProtocol = await (typeof protocol.protocol === 'function'
      ? protocol.protocol()
      : protocol.protocol);
    for (const domain of resolvedProtocol.domains) {
      params.push({
        version: protocol.metadata.versionSlug,
        domain: domain.domain,
      });
    }
  }
  return params;
}
