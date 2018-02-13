import { serializeObject } from '../src/serializeObject';
import { globalConfig } from '../src/config';

describe('serializeObject', () => {
  it('serialize undefined', () => {
    expect(serializeObject(globalConfig, undefined)).toMatchSnapshot();
  });
  it('serialize null', () => {
    expect(serializeObject(globalConfig, null)).toMatchSnapshot();
  });
  it('serialize example object', () => {
    expect(
      serializeObject(globalConfig, { foo: 'a', bar: 123 }),
    ).toMatchSnapshot();
  });
  it('circular', () => {
    const obj: any = { foo: 'a', bar: 123 };
    obj.obj = obj;
    expect(serializeObject(globalConfig, obj)).toMatchSnapshot();
  });
  it('req', () => {
    const obj = {
      req: {
        method: 'GET',
        url: '/foo',
        headers: {},
        connection: {
          remoteAddress: '::0',
          remotePort: 1234,
        },
        extraProp: 'foo',
      },
    };
    expect(serializeObject(globalConfig, obj)).toMatchSnapshot();
  });
  it('res', () => {
    const obj = {
      res: {
        statusCode: 200,
        _header: {},
        extraProp: 'foo',
      },
    };
    expect(serializeObject(globalConfig, obj)).toMatchSnapshot();
  });
  it('many items', () => {
    const obj = {
      longArray: new Array(400),
    };
    expect(serializeObject(globalConfig, obj)).toMatchSnapshot();
  });
});
