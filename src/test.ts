import * as Joi from 'joi';
import {} from 'class-validator';
import 'reflect-metadata';

const fieldMetadataKey = Symbol('field');
const schemaMetadataKey = Symbol('schema');

function Field(a: any) {
  console.log('Field(): evaluated');
  return function(
    target: any,
    propertyKey: string,
    // descriptor: PropertyDescriptor,
  ) {
    console.log('Field(): called');
    // console.log({ target, propertyKey, FooOptions });
    // Reflect.defineMetadata(fieldMetadataKey, a, target.constructor, propertyKey);
    const meta =
      Reflect.getMetadata(
        schemaMetadataKey,
        target.constructor,
        schemaMetadataKey,
      ) || {};
    meta[propertyKey] = a;
    Reflect.defineMetadata(
      fieldMetadataKey,
      a,
      target.constructor,
      schemaMetadataKey,
    );
    // console.log('meta field', meta);
  };
}

function Method(a?: any) {
  console.log('Field(): evaluated');
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    let paramtypes = Reflect.getMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    );
    console.log('Method', { target, propertyKey });
    console.log(paramtypes);
    // const meta = Reflect.getMetadata(fieldMetadataKey, FooOptions, 'name');
    // console.log('type.name', type.name);
    // console.log('meta', meta);
    // console.log('Field(): called');
    // console.log(new FooOptions() instanceof type);
    // console.log(typeof type);
    // console.log(type.toString());
    // console.log(type().toString());
    // console.log(new (type())());
    // console.log('xxxx');
  };
}
function Options(a?: any) {
  console.log('Options(): evaluated');
  return function(
    target: Function,
    // propertyKey: string,
    // descriptor: PropertyDescriptor,
  ) {};
}

function Service(a?: any) {
  console.log('Service(): evaluated');
  return function(
    target: Function,
    // propertyKey: string,
    // descriptor: PropertyDescriptor,
  ) {
    console.log('Service(): called', target.name);
    for (const name of Object.getOwnPropertyNames(target.prototype)) {
      if (name === 'constructor') {
        continue;
      }
      const method = target.prototype[name];
      console.log(name);

      console.log('Service', { target: target.prototype, propertyKey: name });
      let paramtypes = Reflect.getOwnMetadata(
        'design:paramtypes',
        target.prototype,
        name,
      );
      console.log(paramtypes);
      // console.log(name, method);
      // console.log(Object.getOwnPropertyNames(method));
    }
    // console.log(target.prototype.foo);
  };
}

// function Param() {
//   return function(
//     target: Object,
//     propertyKey: string | symbol,
//     parameterIndex: number,
//   ) {
//     console.log('Param(): called');
//     let type = Reflect.getOwnMetadata('design:type', target, propertyKey);
//     console.log(Reflect.getMetadataKeys(target));
//     const str: any = new FooOptions();
//     console.log(str instanceof type);
//     // console.log(type('as'));
//     // for (const name of Object.getOwnPropertyNames(target.prototype)) {
//     //   if (name === 'constructor') {
//     //     continue;
//     //   }
//     //   const method = target.prototype[name];
//     //   console.log(name, method);
//     //   console.log(Object.getOwnPropertyNames(method));
//     // }
//     // console.log(target.prototype.foo);
//   };
// }

@Options()
class FooOptions {
  private constructor() {}

  @Field(Joi.string().required())
  name: string;

  @Field(Joi.number().required())
  id: number;

  @Field(Joi.object().required())
  nested: {
    address: string;
  };

  @Field(Joi.object().required())
  bar?: object;

  @Field(Joi.object().required())
  bar2: object | null;

  @Field(Joi.object().required())
  bar3: number | string;
}

const test: FooOptions = {
  name: 'foo',
  id: 123,
  nested: { address: 'aa' },
  bar2: null,
  bar3: 12,
};

class OtherOptions<T> {
  @Field(
    Joi.array()
      .items(Joi.string())
      .required(),
  )
  items: T[];
}

@Service()
class MyService {
  @Method()
  async foo(options: FooOptions) {}

  // @Method()
  // otherMethod(a: OtherOptions<string>, b: string) {
  //   return 123;
  // }
}

const f = Joi.object().required();
if (f instanceof Joi.Obj) {
}

// class Point {
//   x: number;
//   y: number;
// }

// class Line {
//   private _p0: Point;
//   private _p1: Point;

//   @validate
//   set p0(value: Point) {
//     this._p0 = value;
//   }
//   get p0() {
//     return this._p0;
//   }

//   @validate
//   set p1(value: Point) {
//     this._p1 = value;
//   }
//   get p1() {
//     return this._p1;
//   }
// }

// function validate<T>(
//   target: any,
//   propertyKey: string,
//   descriptor: TypedPropertyDescriptor<T>,
// ) {
//   let set = descriptor.set;
//   descriptor.set = function(value: T) {
//     let type = Reflect.getMetadata('design:type', target, propertyKey);
//     console.log('validate type', type);
//     if (!(value instanceof type)) {
//       throw new TypeError('Invalid type.');
//     }
//     set(value);
//   };
// }

// const l = new Line();
// l.p0 = 'abc' as any;

const def = {
  foo: {
    type: 'string',
    joi: Joi.string(),
  },
};

type Def = {
  [s: string]: {
    type: 'string' | 1;
    joi: Joi.StringSchema;
  };
};

function getType(obj: Def) {}

function guess(a: number) {
  if (a === 1) {
    return 'foo' as string;
  }
  return 100 as number;
}

const ret = guess(1);
