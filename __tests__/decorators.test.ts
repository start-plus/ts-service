import 'reflect-metadata';
import * as Joi from 'joi';
import { service, validate, ignore, schema } from '../src/decorators';

describe('decorators', () => {
  describe('validation', () => {
    it('should throw if method is missing @validate', () => {
      expect(() => {
        @service
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
    it('validate sync function', () => {});
  });
});
