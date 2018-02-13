import { configure, globalConfig } from '../src/config';

describe('config', () => {
  it('should configure', () => {
    configure({ removeFields: ['a', 'b'] });
    expect(globalConfig.removeFields).toEqual(['a', 'b']);
  });
});
