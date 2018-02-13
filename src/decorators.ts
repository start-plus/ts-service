import * as Joi from 'joi';
import * as bunyan from 'bunyan';
import * as util from 'util';
import { getParameterNames } from './getParameterNames';

const serviceMetadataKey = Symbol('service');
const schemaMetadataKey = Symbol('schema');
const validateKey = Symbol('validate');
const loggerMetadataKey = Symbol('logger');

let _seqId = 0;

const globalConfig = {
  removeFields: ['password', 'token', 'accessToken'],
  debug: true,
  depth: 4,
  maxArrayLength: 30,
  loggerFactory: (serviceName: string, config: any) =>
    bunyan.createLogger({
      name: serviceName,
      level: config.debug ? 'debug' : 'error',
    }),
};

/**
 * Remove invalid properties from the object and hide long arrays
 * @param  obj the object
 * @returns the new object with removed properties
 * @private
 */
function _sanitizeObject(obj: any) {
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
      if (globalConfig.removeFields.indexOf(name) !== -1) {
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
      if (Array.isArray(value) && value.length > globalConfig.maxArrayLength) {
        return `Array(${value.length})`;
      }
      return value;
    }),
  );
}
function _combineObject(params: any[], arr: any[]): object {
  const ret: any = {};
  arr.forEach((arg, i) => {
    ret[params[i]] = arg;
  });
  return ret;
}

function _serializeObject(obj: any) {
  return util.inspect(_sanitizeObject(obj), { depth: globalConfig.depth });
}

export function schema(joiSchema: Joi.Schema) {
  return function(target: any, propertyKey?: string, parameterIndex?: number) {
    const metadataKey = propertyKey ? parameterIndex : schemaMetadataKey;
    Reflect.defineMetadata(metadataKey, joiSchema, target, schemaMetadataKey);
  };
}

export function service(target: any) {
  const logger = globalConfig.loggerFactory(target.name, globalConfig);
  Reflect.defineMetadata(
    loggerMetadataKey,
    logger,
    target.prototype,
    loggerMetadataKey,
  );

  for (const methodName of Object.getOwnPropertyNames(target.prototype)) {
    if (methodName === 'constructor') {
      continue;
    }
    const method = target.prototype[methodName];
    const validate = Reflect.getMetadata(
      validateKey,
      target.prototype,
      methodName,
    );
    if (validate == null) {
      throw new Error(
        `Method "${
          target.name
        }.${methodName}" should be annotated with @validate or @ignore`,
      );
    }
    // if (!validate) {
    //   return;
    // }
  }
  return target;
}

export function validate(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor,
) {
  Reflect.defineMetadata(validateKey, true, target, methodName);
  const params =
    Reflect.getMetadata('design:paramtypes', target, methodName) || [];
  const method = target[methodName];
  const paramNames = getParameterNames(method);
  const keys: { [s: string]: Joi.Schema } = {};
  params.forEach((type: Function, i: number) => {
    const paramName = paramNames[i];
    const schema =
      // inline schema
      Reflect.getMetadata(i, target, schemaMetadataKey) ||
      // type schema
      Reflect.getMetadata(schemaMetadataKey, type, schemaMetadataKey);
    if (!schema) {
      throw new Error(
        `Parameter ${paramName} in ${
          target.constructor.name
        }.${methodName} is missing @schema annotation`,
      );
    }
    keys[paramName] = schema;
  });
  descriptor.value = function(...args: any[]) {
    const logger = Reflect.getMetadata(
      loggerMetadataKey,
      target,
      loggerMetadataKey,
    );
    if (!logger) {
      throw new Error(
        `Logger not configured for service ${
          target.constructor.name
        }. Make sure to add @service annotation`,
      );
    }

    const removeOutput = false; // todo
    const logExit = (output: string, id: number) => {
      const formattedOutput = removeOutput
        ? '<removed>'
        : _serializeObject(output);
      logger.debug({ id }, ` EXIT ${methodName}:`, formattedOutput);
      return output;
    };
    console.log({ params, args });
    const id = ++_seqId;
    const formattedInput = params.length
      ? _serializeObject(_combineObject(paramNames, args))
      : '{ }';
    logger.debug({ id }, `ENTER ${methodName}:`, formattedInput);
    let result;

    function withValidation(...args: any[]) {
      let normalized;
      try {
        normalized = Joi.attempt(value, schema);
      } catch (e) {
        if (method.sync) {
          throw e;
        }
        return Promise.reject(e);
      }
      const newArgs = [];
      // Joi will normalize values
      // for example string number '1' to 1
      // if schema type is number
      _.each(params, param => {
        newArgs.push(normalized[param]);
      });
      return method(...newArgs);
    }

    try {
      result = method(...args);
    } catch (e) {
      logger.error(e);
      throw e;
    }
    // promise (or async function)
    if (result && typeof result.then === 'function') {
      return result
        .then((asyncResult: any) => {
          logExit(asyncResult, id);
          return asyncResult;
        })
        .catch((e: Error) => {
          logger.error({ id }, `ERROR ${methodName}: ${formattedInput} \n`, e);
          throw e;
        });
    }
    logExit(result, id);
    return result;
  };
}

export function ignore(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  Reflect.defineMetadata(validateKey, false, target, propertyKey);
}

// @schema(Joi.object())
// class Example {
//   prop1: string;
// }

// @service
// class MyService {
//   @validate
//   searchUsers(criteria: Example) {}

//   @validate
//   getUserById(
//     @schema(Joi.string().required())
//     id: string,
//   ) {}
// }
