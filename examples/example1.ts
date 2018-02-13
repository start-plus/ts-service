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

const calcService = new CalcService();

calcService.add(1, 3); // returns 4
calcService.add('5' as any, '6' as any); // returns 11, input parameters are converted to number types
calcService.add('1' as any, { foo: 'bar' } as any); // logs and throws an error

// function add(a, b) {
//   return a + b;
// }

// add.schema = {
//   a: Joi.number().required(),
//   b: Joi.number().required(),
// };

// // create your service
// const CalcService = {
//   add,
// };

// // decorate it, it will mutate CalcService
// decorate(CalcService, 'CalcService');

// export default CalcService;

// CalcService.add(1, 3); // returns 4
// CalcService.add('5', '6'); // returns 11, input parameters are converted to number types
// CalcService.add('1', { foo: 'bar' }); // logs and throws an error
