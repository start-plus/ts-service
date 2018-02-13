import * as Logger from 'bunyan';
import { Seq } from './Seq';
import { combineObject } from './combineObject';
import { serializeObject } from './serializeObject';
import { Config } from './config';

interface WrapLogOptions<T extends Function> {
  method: T;
  methodName: string;
  paramNames: string[];
  removeOutput: boolean;
  logger: Logger;
  seq: Seq;
  config: Config;
}

export function wrapLog<T extends Function>(options: WrapLogOptions<T>): T {
  const {
    method,
    methodName,
    paramNames,
    removeOutput,
    logger,
    seq,
    config,
  } = options;

  return (function logDecorator(...args: any[]) {
    const logExit = (output: string, id: number) => {
      const formattedOutput = removeOutput
        ? '<removed>'
        : serializeObject(config, output);
      logger.debug({ id }, ` EXIT ${methodName}:`, formattedOutput);
      return output;
    };
    const id = seq.getNext();
    const formattedInput = paramNames.length
      ? serializeObject(config, combineObject(paramNames, args))
      : '{ }';
    logger.debug({ id }, `ENTER ${methodName}:`, formattedInput);
    let result;

    try {
      result = method(...args);
    } catch (e) {
      logger.error({ id }, `ERROR ${methodName}: ${formattedInput} \n`, e);
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
  } as any) as T;
}
