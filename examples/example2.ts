import * as Joi from 'joi';
import { service, validate, schema } from '../';

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

async function test() {
  await userService.createUser({
    name: 'john',
    email: 'john@example.com',
    password: 'secret',
  }); // ok
  await userService.createUser({
    name: 'john',
    email: 'invalid email',
    password: 'secret',
  }); // throw error because email is invalid
}
test().catch(e => {
  throw e;
});
