import { ProtocolImplementationData } from './data';
import { IProtocol } from '@/third-party/protocol-schema';
import { parseQualifiedRef } from '@/data/ProtocolModel';
import { ImplementationModel } from '@/data/ImplementationModel';
import { ImplementationLink } from './ImplementationLink';

export function ImplementationStatsHeader() {
  return (
    <div className="lg:flex flex-row hidden">
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Implementation
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Coverage
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Domains
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Commands
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Events
      </div>
      <div className="text-sm w-1/6 text-gray-500 dark:text-gray-400">
        Types
      </div>
    </div>
  );
}
export function ImplementationStats({
  implementation,
  implementationId,
  protocol,
  protocolImplementationData,
}: {
  implementation: ImplementationModel;
  implementationId: string;
  protocol: IProtocol;
  protocolImplementationData: ProtocolImplementationData;
}) {
  const { references } =
    protocolImplementationData.referencesByImplementationId.get(
      implementationId,
    )!;
  let protocolStats = {
    commandCount: 0,
    eventCount: 0,
    typeCount: 0,
    domainCount: 0,
  };
  for (const domain of protocol.domains) {
    protocolStats.commandCount += domain.commands?.length ?? 0;
    protocolStats.eventCount += domain.events?.length ?? 0;
    protocolStats.typeCount += domain.types?.length ?? 0;
    if (
      domain.commands?.length ||
      domain.events?.length ||
      domain.types?.length
    ) {
      protocolStats.domainCount++;
    }
  }
  const implementationStats = {
    commandCount: 0,
    eventCount: 0,
    typeCount: 0,
    domainCount: 0,
  };
  const referencedDomains = new Set<string>();
  for (const [command, commandReferences] of Object.entries(
    references.commands,
  )) {
    if (commandReferences.length) {
      implementationStats.commandCount++;
      const { domain } = parseQualifiedRef(command);
      referencedDomains.add(domain);
    }
  }
  for (const [event, eventReferences] of Object.entries(references.events)) {
    if (eventReferences.length) {
      implementationStats.eventCount++;
      const { domain } = parseQualifiedRef(event);
      referencedDomains.add(domain);
    }
  }
  for (const [type, typeReferences] of Object.entries(references.types)) {
    if (typeReferences.length) {
      implementationStats.typeCount++;
      const { domain } = parseQualifiedRef(type);
      referencedDomains.add(domain);
    }
  }
  implementationStats.domainCount = referencedDomains.size;
  return (
    <div>
      <div className="flex flex-row flex-wrap lg:gap-0 gap-y-2 gap-x-4 justify-start">
        <div className="text-base font-bold lg:w-1/6 pt-1 w-full">
          <span className="lg:hidden font-bold text-sm text-gray-500 dark:text-gray-400">
            Implementation:{' '}
          </span>
          <ImplementationLink
            implementationId={implementationId}
            implementation={implementation}
          />
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Coverage
          </div>
          {Math.round(
            (100 *
              (implementationStats.commandCount +
                implementationStats.eventCount +
                implementationStats.typeCount)) /
              (protocolStats.commandCount +
                protocolStats.eventCount +
                protocolStats.typeCount),
          )}
          %
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Domains
          </div>
          {implementationStats.domainCount} / {protocolStats.domainCount}
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Commands
          </div>
          {implementationStats.commandCount} / {protocolStats.commandCount}
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Events
          </div>
          {implementationStats.eventCount} / {protocolStats.eventCount}
        </div>
        <div className="text-2xl font-bold lg:w-1/6">
          <div className="lg:hidden font-normal text-sm text-gray-500 dark:text-gray-400">
            Types
          </div>
          {implementationStats.typeCount} / {protocolStats.typeCount}
        </div>
      </div>
    </div>
  );
}
