import * as Logger from 'bunyan';

export interface Config {
  removeFields: string[];
  debug: boolean;
  depth: number;
  maxArrayLength: number;
  loggerFactory: (serviceName: string) => Logger;
}

export function getDefaultConfig(): Config {
  return {
    removeFields: ['password', 'token', 'accessToken'],
    debug: true,
    depth: 4,
    maxArrayLength: 30,
    loggerFactory(serviceName) {
      return Logger.createLogger({
        name: serviceName,
        level: this.debug ? 'debug' : 'error',
      });
    },
  };
}

export const globalConfig = getDefaultConfig();

export function configure(config: Partial<Config>) {
  Object.assign(globalConfig, config);
}
