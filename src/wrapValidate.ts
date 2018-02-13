import * as Joi from 'joi';
import { combineObject } from './combineObject';

interface WrapValidateOptions<T extends Function> {
  keysSchema: { [s: string]: Joi.Schema };
  method: T;
  methodName: string;
  paramNames: string[];
  sync: boolean;
}

export function wrapValidate<T extends Function>(
  options: WrapValidateOptions<T>,
): T {
  const { keysSchema, method, methodName, paramNames, sync } = options;

  return (function validateDecorator(...args: any[]) {
    const value = combineObject(paramNames, args);
    let normalized: any;
    try {
      normalized = Joi.attempt(
        value,
        Joi.object()
          .keys(keysSchema)
          .required(),
      );
    } catch (e) {
      if (sync) {
        throw e;
      }
      return Promise.reject(e);
    }
    const newArgs: any[] = [];
    // Joi will normalize values
    // for example string number '1' to 1
    // if schema type is number
    paramNames.forEach(param => {
      newArgs.push(normalized[param]);
    });
    return method(...newArgs);
  } as any) as T;
}
