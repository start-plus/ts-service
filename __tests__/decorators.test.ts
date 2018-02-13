// tslint:disable:max-classes-per-file
import 'reflect-metadata';
import * as Joi from 'joi';
import * as Logger from 'bunyan';
import {
  service,
  validate,
  ignore,
  schema,
  seq,
  removeOutput,
} from '../src/decorators';
import { globalConfig } from '../src/config';

describe('decorators', () => {
  describe('validation', () => {
    it('should throw if method is missing @validate', () => {
      expect(() => {
        @service
        // @ts-ignore
        class MyService {
          foo() {
            return 10;
          }
        }
      }).toThrowErrorMatchingSnapshot();
    });

    it('should not throw if method is annotated with @validate', () => {
      expect(() => {
        @service
        // @ts-ignore
        class MyService {
          @validate
          foo() {
            return 10;
          }
        }
      }).not.toThrow();
    });

    it('should not throw if method is annotated with @ignore', () => {
      expect(() => {
        @service
        // @ts-ignore
        class MyService {
          @ignore
          foo() {
            return 10;
          }
        }
      }).not.toThrow();
    });

    it('should throw if param is missing @schema annotation', () => {
      expect(() => {
        class InvalidOptions {
          id: number;
        }

        @service
        // @ts-ignore
        class MyService {
          @validate
          foo(options: InvalidOptions) {
            return 10;
          }
        }
      }).toThrowErrorMatchingSnapshot();
    });

    it('should throw if 2nd param is missing @schema annotation', () => {
      expect(() => {
        @schema(Joi.object())
        class ValidOptions {
          id: number;
        }
        class InvalidOptions {
          id: number;
        }

        @service
        // @ts-ignore
        class MyService {
          @validate
          foo(options1: ValidOptions, options2: InvalidOptions) {
            return 10;
          }
        }
      }).toThrowErrorMatchingSnapshot();
    });

    it('should not throw with annotated with inline @schema', () => {
      expect(() => {
        @service
        // @ts-ignore
        class MyService {
          @validate
          foo(
            @schema(Joi.number().required())
            id: number,
          ) {
            return id + 10;
          }
        }
      }).not.toThrow();
    });
  });

  describe('functional', () => {
    let logger: Logger;
    beforeEach(() => {
      seq.reset();
      logger = getLogger();
      globalConfig.loggerFactory = () => logger;
    });

    function getLogger() {
      return ({
        error: jest.fn(),
        debug: jest.fn(),
      } as any) as Logger;
    }
    it('validate sync function', () => {
      @service
      class MyService {
        @validate
        foo(
          @schema(
            Joi.number()
              .positive()
              .required(),
          )
          a: number,
        ) {
          return a + 10;
        }
      }

      const myService = new MyService();
      expect(() => {
        myService.foo(10);
      }).not.toThrow();
      expect(() => {
        myService.foo(-10);
      }).toThrowErrorMatchingSnapshot();
      expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
      expect((logger.error as jest.Mock<any>).mock.calls).toMatchSnapshot();
    });

    it('validate async function', async () => {
      @service
      class MyService {
        @validate
        async foo(
          @schema(
            Joi.number()
              .positive()
              .required(),
          )
          a: number,
        ) {
          return a + 10;
        }
      }

      const myService = new MyService();
      await expect(myService.foo(10)).resolves.toBe(20);
      await expect(myService.foo(-10)).rejects.toThrowErrorMatchingSnapshot();
      expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
      expect((logger.error as jest.Mock<any>).mock.calls).toMatchSnapshot();
    });

    it('with @removeOutput', () => {
      @service
      class MyService {
        @validate
        @removeOutput
        foo(
          @schema(
            Joi.number()
              .positive()
              .required(),
          )
          a: number,
        ) {
          return a + 10;
        }
      }

      const myService = new MyService();
      myService.foo(10);
      expect((logger.debug as jest.Mock<any>).mock.calls).toMatchSnapshot();
    });
  });
});
