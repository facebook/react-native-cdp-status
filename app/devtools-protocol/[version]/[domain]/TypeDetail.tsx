import React from 'react';
import { Protocol } from '@/third-party/protocol-schema';

export function TypeDetail({ type }: { type: Protocol.ProtocolType }) {
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
