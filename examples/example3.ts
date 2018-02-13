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

securityService.hashPassword('secret-password');
