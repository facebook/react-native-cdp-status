import {
  ImplementationModel,
  ImplementationModelBase,
  ImplementationProtocolReferences,
} from './ImplementationModel';
import { IProtocol } from '@/third-party/protocol-schema';

const CDP_HANDLER_CPP = 'API/hermes/inspector/chrome/CDPHandler.cpp';
const MESSAGE_TYPES_H = 'API/hermes/inspector/chrome/MessageTypes.h';

export class HermesImplementationModel
  extends ImplementationModelBase
  implements ImplementationModel
{
  constructor() {
    super();
  }

  #files = new Map<string, string>();
  #fetchDataPromise: Promise<void> | undefined;

  async #fetchFile(path: string) {
    if (this.#files.has(path)) {
      return;
    }
    const res = await fetch(
      'https://raw.githubusercontent.com/facebook/hermes/main/' +
        encodeURIComponent(path),
      {
        next: {
          revalidate: 3600, // 1 hour
        },
      },
    );
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${path}: ${res.status} ${res.statusText}`,
      );
    }
    this.#files.set(path, await res.text());
  }

  #fetchData() {
    if (this.#fetchDataPromise) {
      return this.#fetchDataPromise;
    }
    this.#fetchDataPromise = (async () => {
      try {
        await Promise.all([
          this.#fetchFile(CDP_HANDLER_CPP),
          this.#fetchFile(MESSAGE_TYPES_H),
        ]);
      } catch (e) {
        this.#fetchDataPromise = undefined;
        throw e;
      }
    })();
    return this.#fetchDataPromise;
  }

  async extractProtocolReferences(protocol: IProtocol) {
    await this.#fetchData();
    const references: ImplementationProtocolReferences = {
      commands: {},
      events: {},
      types: {},
    };
    const findAndPushMatches = (
      pathsToSearch: string[],
      obj: typeof references.commands | typeof references.events,
      name: string,
      needles: string[],
    ) => {
      const regex = new RegExp(
        '\\b' +
          '(' +
          needles.map((needle) => escapeRegExp(needle)).join('|') +
          ')' +
          '\\b',
        'g',
      );
      for (const path of pathsToSearch) {
        const file = this.#files.get(path)!;
        for (const match of file.matchAll(regex)) {
          obj[name] = obj[name] ?? [];
          obj[name].push({
            path,
            match: match[0],
            index: match.index!,
            length: match[0].length,
          });
        }
      }
    };
    for (const domain of protocol.domains) {
      for (const command of domain.commands ?? []) {
        const hermesRequestId = `m::${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(command.name)}Request`;
        const hermesResponseId = `m::${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(command.name)}Response`;
        const stringLiteral = quoteCppString(
          `${domain.domain}.${command.name}`,
        );
        findAndPushMatches(
          [CDP_HANDLER_CPP],
          references.commands,
          `${domain.domain}.${command.name}`,
          [hermesRequestId, hermesResponseId, stringLiteral],
        );
      }
      for (const event of domain.events ?? []) {
        const hermesEventId = `m::${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(event.name)}Notification`;
        const stringLiteral = quoteCppString(`${domain.domain}.${event.name}`);
        findAndPushMatches(
          [CDP_HANDLER_CPP],
          references.events,
          `${domain.domain}.${event.name}`,
          [hermesEventId, stringLiteral],
        );
      }
      for (const type of domain.types ?? []) {
        const hermesTypeId = `${pascalCaseToCamelCase(
          domain.domain,
        )}::${camelCaseToPascalCase(type.id)}`;
        findAndPushMatches(
          [MESSAGE_TYPES_H],
          references.types,
          `${domain.domain}.${type.id}`,
          [hermesTypeId],
        );
      }
    }
    return references;
  }
}

function pascalCaseToCamelCase(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

function camelCaseToPascalCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function quoteCppString(str: string) {
  return `"${str.replace(/"/g, '\\"')}"`;
}
