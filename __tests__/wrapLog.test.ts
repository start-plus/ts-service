import * as Logger from 'bunyan';
import { wrapLog } from '../src/wrapLog';
import { Seq } from '../src/Seq';
import { getDefaultConfig } from '../src/config';

describe('wrapLog', () => {
  function getLogger() {
    return ({
      error: jest.fn(),
      debug: jest.fn(),
    } as any) as Logger;
  }

  it('log sync', () => {
    const logger = getLogger();
    const seq = new Seq();
    const fn = wrapLog({
      logger,
      method: (a: number) => a + 10,
      methodName: 'testMethod',
      paramNames: ['a'],
      config: getDefaultConfig(),
      seq,
      removeOutput: false,
    });
    expect(fn(1)).toBe(11);
    expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
  });

  it('log async', async () => {
    const logger = getLogger();
    const seq = new Seq();
    const fn = wrapLog({
      logger,
      method: async (a: number) => a + 10,
      methodName: 'testMethod',
      paramNames: ['a'],
      config: getDefaultConfig(),
      seq,
      removeOutput: false,
    });
    await expect(fn(1)).resolves.toBe(11);
    expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
  });

  it('sanitized input', () => {
    const logger = getLogger();
    const seq = new Seq();
    const fn = wrapLog({
      logger,
      method: (
        password: string,
        values: { accessToken: string; foo: number },
      ) => 'ok',
      methodName: 'testMethod',
      paramNames: ['password', 'values'],
      config: getDefaultConfig(),
      seq,
      removeOutput: false,
    });
    expect(fn('pass', { accessToken: 'token', foo: 123 })).toBe('ok');
    expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
  });

  it('remove output', () => {
    const logger = getLogger();
    const seq = new Seq();
    const fn = wrapLog({
      logger,
      method: (a: number) => a + 10,
      methodName: 'testMethod',
      paramNames: ['a'],
      config: getDefaultConfig(),
      seq,
      removeOutput: true,
    });
    expect(fn(1)).toBe(11);
    expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
  });

  it('sync error', () => {
    const logger = getLogger();
    const seq = new Seq();
    const fn = wrapLog({
      logger,
      method: () => {
        throw new Error('some error');
      },
      methodName: 'testMethod',
      paramNames: [],
      config: getDefaultConfig(),
      seq,
      removeOutput: false,
    });
    expect(() => fn()).toThrow();
    expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
    expect((logger.error as jest.Mock<any>).mock.calls).toMatchSnapshot();
  });

  it('async error', async () => {
    const logger = getLogger();
    const seq = new Seq();
    const fn = wrapLog({
      logger,
      method: async () => {
        throw new Error('some error');
      },
      methodName: 'testMethod',
      paramNames: [],
      config: getDefaultConfig(),
      seq,
      removeOutput: false,
    });
    await expect(fn()).rejects.toThrow();
    expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
    expect((logger.error as jest.Mock<any>).mock.calls).toMatchSnapshot();
  });
});
