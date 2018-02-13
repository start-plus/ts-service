import * as Joi from 'joi';
import { getParameterNames } from './getParameterNames';

const serviceMetadataKey = Symbol('service');
const schemaMetadataKey = Symbol('schema');
const validateKey = Symbol('validate');

export function schema(joiSchema: Joi.Schema) {
  return function(target: any, propertyKey?: string, parameterIndex?: number) {
    const metadataKey = propertyKey ? parameterIndex : schemaMetadataKey;
    Reflect.defineMetadata(metadataKey, joiSchema, target, schemaMetadataKey);
  };
}

export function service(target: any) {
  for (const name of Object.getOwnPropertyNames(target.prototype)) {
    if (name === 'constructor') {
      continue;
    }
    const method = target.prototype[name];
    const validate = Reflect.getMetadata(validateKey, target.prototype, name);
    if (validate == null) {
      throw new Error(
        `Method "${
          target.name
        }.${name}" should be annotated with @validate or @ignore`,
      );
    }
    if (!validate) {
      return;
    }
  }
}

export function validate(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  Reflect.defineMetadata(validateKey, true, target, propertyKey);
  const params =
    Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
  const method = target[propertyKey];
  const paramNames = getParameterNames(method);
  params.forEach((type: Function, i: number) => {
    const schema =
      // inline schema
      Reflect.getMetadata(i, target, schemaMetadataKey) ||
      // type schema
      Reflect.getMetadata(schemaMetadataKey, type, schemaMetadataKey);
    if (!schema) {
      throw new Error(
        `Parameter ${paramNames[i]} in ${
          target.constructor.name
        }.${propertyKey} is missing @schema annotation`,
      );
    }
  });
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
