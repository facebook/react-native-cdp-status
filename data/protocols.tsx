import DevToolsBrowserProtocol from 'devtools-protocol/json/browser_protocol.json';

const devToolsProtocolsByVersionSlug: ReadonlyMap<
  string,
  Readonly<{
    protocol: typeof DevToolsBrowserProtocol;
    metadata: {
      versionSlug: string;
    };
  }>
> = new Map(
  [DevToolsBrowserProtocol].map((protocol) => {
    const versionSlug = `${protocol.version.major}-${protocol.version.minor}`;
    return [
      versionSlug,
      {
        protocol,
        metadata: {
          versionSlug,
        },
      },
    ];
  }),
);

export { devToolsProtocolsByVersionSlug };
