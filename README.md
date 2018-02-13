# ts-service
[![Build Status](https://travis-ci.org/start-plus/ts-service.svg?branch=master)](https://travis-ci.org/start-plus/ts-service)
[![codecov](https://codecov.io/gh/start-plus/ts-service/branch/master/graph/badge.svg)](https://codecov.io/gh/start-plus/ts-service)

ts-service is a TypeScript library for validation and logging.  
It depends on [joi](https://github.com/hapijs/joi) (validator) and [bunyan](https://github.com/trentm/node-bunyan) (logger)

## Installation

```
npm i ts-service
```


## Sample usage (inline annotation)
file `services/CalcService.js`
```ts
import * as Joi from 'joi';
import { service, validate, schema } from 'ts-service';

@service
class CalcService {
  @validate
  add(
    @schema(Joi.number().required())
    a: number,
    @schema(Joi.number().required())
    b: number,
  ) {
    return a + b;
  }
}

// create your service
export const calcService = new CalcService();

```

use service
```ts
import {calcService} from './services/CalcService';


calcService.add(1, 3); // returns 4
calcService.add('5' as any, '6' as any); // returns 11, input parameters are converted to number types
calcService.add('1' as any, { foo: 'bar' } as any); // logs and throws an error
// NOTE: you shouldn't use casting `as any` in your code. It's used only for a demonstration purpose.
// The service is expected to be called with unknown input (for example: req.body).
```

![Alt text](./.github/example1.png)

See example under `example/example1.js`. Run it using `npm run example1`.


## Async sample usage
file `services/UserService.js`
```ts
import * as Joi from 'joi';
import { service, validate, schema } from 'ts-service';

@schema(
  Joi.object().keys({
    name: Joi.string()
      .required()
      .alphanum(),
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(5),
  }),
)
class CreateUserValues {
  name: string;
  email: string;
  password: string;
}

@service
class UserService {
  @validate
  async createUser(values: CreateUserValues) {
    const id = 1;
    return id;
  }
}

// create your service
export const userService = new UserService();

```

use service
```ts
import {userService} from './services/UserService';

await userService.createUser({
  name: 'john',
  email: 'john@example.com',
  password: 'secret',
}); // ok
await userService.createUser({
  name: 'john',
  email: 'invalid email',
  password: 'secret',
}); // throws an error
```

![Alt text](./.github/example2.png)

See example under `example/example2.js`. Run it using `npm run example2`.  


## Removing security information
By default properties `password`, `token`, `accessToken` are removed from logging.  
Additionally you can annotated method with `@removeOutput` to remove the method result.  
Example:

file `services/SecurityService.js`
```ts
import * as Joi from 'joi';
import { service, validate, schema, removeOutput } from '../';

@service
class SecurityService {
  @validate
  @removeOutput
  hashPassword(
    @schema(Joi.string().required())
    password: string,
  ) {
    return 'ba817ef716'; // hash password here
  }
}

// create your service
export const securityService = new SecurityService();

```

use service
```ts
import {securityService} from './services/SecurityService';

securityService.hashPassword('secret-password');
```

![Alt text](./.github/example3.png)

See example under `example/example3.js`. Run it using `npm run example3`.


## Configuration
```ts
import {configure} from 'ts-service';

decorate.configure({
  removeFields: string[], // the array of fields not won't be logged to the console, default: ['password', 'token', 'accessToken'],
  debug: boolean,           // the flag is parameter/ouput logging is enabled, (errors are always enabled), default: true
  depth: number,               // the object depth level when serializing, default: 4           
  maxArrayLength: number,      // the maximum number of elements to include when formatting an array, default: 30  
})
```

You must configure it, before creating any service.

## Special properties
if the parameter name is `req` it's assumed that the object is an express request.  
Only properties are logged: `method`, `url`, `headers`, `remoteAddress`, `remotePort`.  


if the parameter name is `res` it's assumed that the object is an express response.  
Only properties are logged: `statusCode`, `header`.  



MIT License