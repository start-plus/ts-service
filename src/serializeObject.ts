import * as util from 'util';
import { Config } from './config';

/**
 * Remove invalid properties from the object and hide long arrays
 * @param  obj the object
 * @returns the new object with removed properties
 * @private
 */
function _sanitizeObject(config: Config, obj: any) {
  if (obj === undefined) {
    return obj;
  }
  const seen: any[] = [];
  return JSON.parse(
    JSON.stringify(obj, (name, value) => {
      if (seen.indexOf(value) !== -1) {
        return '[Circular]';
      }
      if (value != null && typeof value === 'object') {
        seen.push(value);
      }
      // Array of field names that should not be logged
      // add field if necessary (password, tokens etc)
      if (config.removeFields.indexOf(name) !== -1) {
        return '<removed>';
      }
      if (name === 'req' && value && value.connection) {
        return {
          method: value.method,
          url: value.url,
          headers: value.headers,
          remoteAddress: value.connection.remoteAddress,
          remotePort: value.connection.remotePort,
        };
      }
      if (name === 'res' && value && value.statusCode) {
        return {
          statusCode: value.statusCode,
          header: value._header,
        };
      }
      if (Array.isArray(value) && value.length > config.maxArrayLength) {
        return `Array(${value.length})`;
      }
      return value;
    }),
  );
}

export function serializeObject(config: Config, obj: any) {
  return util.inspect(_sanitizeObject(config, obj), { depth: config.depth });
}
