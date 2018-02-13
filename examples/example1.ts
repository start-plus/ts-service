import * as Joi from 'joi';
import { service, validate, schema } from '../';

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

calcService.add(1, 3); // returns 4
calcService.add('5' as any, '6' as any); // returns 11, input parameters are converted to number types
calcService.add('1' as any, { foo: 'bar' } as any); // logs and throws an error
