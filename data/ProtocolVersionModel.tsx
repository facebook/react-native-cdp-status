import { IProtocol } from '@/third-party/protocol-schema';
import { ProtocolModel } from './ProtocolModel';

export type ProtocolVersion = Readonly<{
  protocol: IProtocol | (() => Promise<IProtocol>);
  metadata: ProtocolVersionMetadata;
}>;

export type ProtocolVersionMetadata = {
  description: string;
  versionName: string;
  versionSlug: string;
  dataSource: {
    github: {
      owner: string;
      repo: string;
      commitSha: string;
      path?: string;
    };
  };
  isAvailableUpstream: boolean;
};

export class ProtocolVersionModel {
  protocolVersion: ProtocolVersion;
  versionSlug: string;

  constructor(protocolVersion: ProtocolVersion, versionSlug: string) {
    this.protocolVersion = protocolVersion;
    this.versionSlug = versionSlug;
  }

  #protocol = null as null | Promise<ProtocolModel>;

  async protocol() {
    if (this.#protocol) {
      return await this.#protocol;
    }
    this.#protocol = Promise.resolve(
      typeof this.protocolVersion.protocol === 'function'
        ? this.protocolVersion.protocol()
        : this.protocolVersion.protocol,
    ).then((protocol) => new ProtocolModel(protocol));
    try {
      return await this.#protocol;
    } catch (e) {
      this.#protocol = null;
      throw e;
    }
  }

  async metadata() {
    return this.protocolVersion.metadata;
  }
}
