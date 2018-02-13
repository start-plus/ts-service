import * as Joi from 'joi';
import { combineObject } from './combineObject';

export interface WrapValidateOptions<T> {
  keysSchema: { [s: string]: Joi.Schema };
  method: T;
  paramNames: string[];
  sync: boolean;
}

export function wrapValidate<T extends (...args: any[]) => any>(
  options: WrapValidateOptions<T>,
): T {
  const { keysSchema, method, paramNames, sync } = options;

  return (function validateDecorator(this: any, ...args: any[]) {
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
    return method.call(this, ...newArgs);
  } as any) as T;
}
