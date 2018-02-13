import * as Joi from 'joi';
import { wrapValidate } from '../src/wrapValidate';

describe('wrapValidate', () => {
  it('wrap sync', () => {
    const fn = wrapValidate({
      keysSchema: {
        a: Joi.number().positive(),
      },
      method: (a: number) => a + 10,
      paramNames: ['a'],
      sync: true,
    });
    expect(fn(1)).toEqual(11);
    expect(fn('1' as any)).toEqual(11);
    expect(() => fn(-1)).toThrowErrorMatchingSnapshot();
  });

  it('wrap async', async () => {
    const fn = wrapValidate({
      keysSchema: {
        a: Joi.number().positive(),
      },
      method: async (a: number) => a + (await Promise.resolve(10)),
      paramNames: ['a'],
      sync: false,
    });
    await expect(fn(1)).resolves.toEqual(11);
    await expect(fn('1' as any)).resolves.toEqual(11);
    await expect(fn(-1)).rejects.toThrowErrorMatchingSnapshot();
  });
});
