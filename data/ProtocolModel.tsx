import { IProtocol, Protocol } from '@/third-party/protocol-schema';

export class ProtocolModel {
  readonly protocol: IProtocol;
  #domainsByName: ReadonlyMap<string, Protocol.Domain> | undefined;
  #commandsByQualifiedName: ReadonlyMap<string, Protocol.Command> | undefined;
  #eventsByQualifiedName: ReadonlyMap<string, Protocol.Event> | undefined;
  #typesByQualifiedId: ReadonlyMap<string, Protocol.ProtocolType> | undefined;

  constructor(protocol: IProtocol) {
    this.protocol = protocol;
  }

  domain(domainName: string): Protocol.Domain | undefined {
    if (!this.#domainsByName) {
      this.#domainsByName = new Map(
        this.protocol.domains.map((domain) => [domain.domain, domain]),
      );
    }
    return this.#domainsByName.get(domainName);
  }

  domainEnforcing(domainName: string): Protocol.Domain {
    const domain = this.domain(domainName);
    if (!domain) {
      throw new Error(`No domain named ${domainName}`);
    }
    return domain;
  }

  command({
    domain,
    localName,
  }: {
    domain: string;
    localName: string;
  }): Protocol.Command | undefined {
    if (!this.#commandsByQualifiedName) {
      this.#commandsByQualifiedName = new Map(
        this.protocol.domains.flatMap((domain) =>
          (domain.commands ?? []).map((command) => [
            `${domain.domain}.${command.name}`,
            command,
          ]),
        ),
      );
    }
    return this.#commandsByQualifiedName.get(`${domain}.${localName}`);
  }

  commandEnforcing({
    domain,
    localName,
  }: {
    domain: string;
    localName: string;
  }): Protocol.Command {
    const command = this.command({ domain, localName });
    if (!command) {
      throw new Error(`No command named ${domain}.${localName}`);
    }
    return command;
  }

  event({
    domain,
    localName,
  }: {
    domain: string;
    localName: string;
  }): Protocol.Event | undefined {
    if (!this.#eventsByQualifiedName) {
      this.#eventsByQualifiedName = new Map(
        this.protocol.domains.flatMap((domain) =>
          (domain.events ?? []).map((event) => [
            `${domain.domain}.${event.name}`,
            event,
          ]),
        ),
      );
    }
    return this.#eventsByQualifiedName.get(`${domain}.${localName}`);
  }

  eventEnforcing({
    domain,
    localName,
  }: {
    domain: string;
    localName: string;
  }): Protocol.Event {
    const event = this.event({ domain, localName });
    if (!event) {
      throw new Error(`No event named ${domain}.${localName}`);
    }
    return event;
  }

  type({
    domain,
    localName,
  }: {
    domain: string;
    localName: string;
  }): Protocol.ProtocolType | undefined {
    if (!this.#typesByQualifiedId) {
      this.#typesByQualifiedId = new Map(
        this.protocol.domains.flatMap((domain) =>
          (domain.types ?? []).map((type) => [
            `${domain.domain}.${type.id}`,
            type,
          ]),
        ),
      );
    }
    return this.#typesByQualifiedId.get(`${domain}.${localName}`);
  }

  typeEnforcing({
    domain,
    localName,
  }: {
    domain: string;
    localName: string;
  }): Protocol.ProtocolType {
    const type = this.type({ domain, localName });
    if (!type) {
      throw new Error(`No type named ${domain}.${localName}`);
    }
    return type;
  }

  filterProtocol({
    refs,
  }: {
    refs: readonly {
      $ref: string;
      kind: 'command' | 'event' | 'type';
    }[];
  }) {
    // Crawl the protocol to find all referenced commands, events, and types based on the given refs.
    const referencedCommands = new Set<string>();
    const referencedEvents = new Set<string>();
    const referencedTypes = new Set<string>();
    const visitType = (type: Protocol.ProtocolType, originDomain: string) => {
      if ('$ref' in type) {
        if (referencedTypes.has(type.$ref)) {
          return;
        }
        referencedTypes.add(type.$ref);
        const { domain, localName } = resolveMaybeQualifiedRef({
          $ref: type.$ref,
          domain: originDomain,
        });
        visitType(this.typeEnforcing({ domain, localName }), domain);
        return;
      }
      switch (type.type) {
        case 'array':
          visitType(type.items, originDomain);
          break;
        case 'object':
          for (const property of type.properties ?? []) {
            visitType(property, originDomain);
          }
          break;
        case 'number':
        case 'string':
        case 'boolean':
        case 'integer':
        case 'any':
          // noop
          break;
        default:
          throw new Error(`Unhandled type ${JSON.stringify(type as never)}`);
      }
    };
    const visitCommand = (commandRef: string) => {
      // if not already visited, mark command as referenced and visit its parameters
      if (referencedCommands.has(commandRef)) {
        return;
      }
      referencedCommands.add(commandRef);
      const { domain } = parseQualifiedRef(commandRef);
      const command = this.commandEnforcing(parseQualifiedRef(commandRef));
      command.parameters?.forEach((parameter) => {
        visitType(parameter, domain);
      });
      command.returns?.forEach((property) => visitType(property, domain));
    };
    const visitEvent = (eventRef: string) => {
      // if not already visited, mark event as referenced and visit its parameters
      if (referencedEvents.has(eventRef)) {
        return;
      }
      referencedEvents.add(eventRef);
      const { domain } = parseQualifiedRef(eventRef);
      const event = this.eventEnforcing(parseQualifiedRef(eventRef));
      event.parameters?.forEach((parameter) => {
        visitType(parameter, domain);
      });
    };
    for (const { $ref, kind } of refs) {
      switch (kind) {
        case 'command':
          visitCommand($ref);
          break;
        case 'event':
          visitEvent($ref);
          break;
        case 'type':
          const { domain, localName } = parseQualifiedRef($ref);
          visitType(this.typeEnforcing({ domain, localName }), domain);
          break;
      }
    }
    // Filter the protocol to only include the transitively referenced commands, events, and types.
    const domains = this.protocol.domains
      .map((domain) => {
        const commands = domain.commands?.filter((command) => {
          const key = `${domain.domain}.${command.name}`;
          return referencedCommands.has(key);
        });
        const events = domain.events?.filter((event) => {
          const key = `${domain.domain}.${event.name}`;
          return referencedEvents.has(key);
        });
        const types = domain.types?.filter((type) => {
          const key = `${domain.domain}.${type.id}`;
          return referencedTypes.has(key);
        });
        return {
          ...domain,
          commands,
          events,
          types,
        };
      })
      .filter(
        (domain) =>
          (domain.commands?.length ?? 0) > 0 ||
          (domain.events?.length ?? 0) > 0 ||
          (domain.types?.length ?? 0) > 0,
      );
    return {
      ...this.protocol,
      domains,
    };
  }
}

export function parseQualifiedRef($ref: string) {
  const [domain, ...rest] = $ref.split('.');
  // throw if this isn't a qualified ref
  if (rest.length === 0) {
    throw new Error(`Expected qualified ref, got ${$ref}`);
  }
  const localName = rest.join('.');
  return { domain, localName };
}

export function resolveMaybeQualifiedRef({
  $ref,
  domain,
}: {
  $ref: string;
  domain: string;
}) {
  if ($ref.includes('.')) {
    const [qualifiedDomain, ...rest] = $ref.split('.');
    const localName = rest.join('.');
    return { domain: qualifiedDomain, localName, $ref };
  }
  return { domain, localName: $ref, $ref: `${domain}.${$ref}` };
}
