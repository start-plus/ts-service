import * as Joi from 'joi';
import 'reflect-metadata';
import { getParameterNames } from './getParameterNames';
import { globalConfig } from './config';
import { Seq } from './Seq';
import { wrapLog } from './wrapLog';
import { wrapValidate } from './wrapValidate';

const schemaMetadataKey = Symbol('schema');
const validateKey = Symbol('validate');
const loggerMetadataKey = Symbol('logger');
const removeOutputMetadataKey = Symbol('removeOutput');

export const seq = new Seq();

export function schema(joiSchema: Joi.Schema) {
  return function schemaDecorator(
    target: any,
    propertyKey?: string,
    parameterIndex?: number,
  ) {
    const metadataKey = propertyKey ? parameterIndex : schemaMetadataKey;
    Reflect.defineMetadata(metadataKey, joiSchema, target, schemaMetadataKey);
  };
}

export function service(target: any) {
  const logger = globalConfig.loggerFactory(target.name);
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
    const shouldValidate = Reflect.getMetadata(
      validateKey,
      target.prototype,
      methodName,
    );
    if (shouldValidate == null) {
      throw new Error(
        `Method "${
          target.name
        }.${methodName}" should be annotated with @validate or @ignore`,
      );
    }
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
  const returnType = Reflect.getMetadata(
    'design:returntype',
    target,
    methodName,
  );
  const sync = !returnType || returnType.name !== 'Promise';
  const method = target[methodName];
  const paramNames = getParameterNames(method);
  const keysSchema: { [s: string]: Joi.Schema } = {};
  params.forEach((type: () => any, i: number) => {
    const paramName = paramNames[i];
    const schemaDef =
      // inline schema
      Reflect.getMetadata(i, target, schemaMetadataKey) ||
      // type schema
      Reflect.getMetadata(schemaMetadataKey, type, schemaMetadataKey);
    if (!schemaDef) {
      throw new Error(
        `Parameter ${paramName} in ${
          target.constructor.name
        }.${methodName} is missing @schema annotation`,
      );
    }
    keysSchema[paramName] = schemaDef;
  });
  descriptor.value = function decorated(...args: any[]) {
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
    const withValidation = wrapValidate({
      keysSchema,
      method,
      paramNames,
      sync,
    });
    const withLogging = wrapLog({
      logger,
      method: withValidation.bind(this),
      methodName,
      paramNames,
      config: globalConfig,
      seq,
      removeOutput:
        Reflect.getMetadata(removeOutputMetadataKey, target, methodName) ||
        false,
    });

    return withLogging.call(this, ...args);
  };
}

export function ignore(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  Reflect.defineMetadata(validateKey, false, target, propertyKey);
}

export function removeOutput(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  Reflect.defineMetadata(removeOutputMetadataKey, true, target, propertyKey);
}
