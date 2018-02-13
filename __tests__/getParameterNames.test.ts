import { getParameterNames as arg } from '../src/getParameterNames';

describe('function tests', () => {
  it('test1', () => {
    function /* (no parenthesis like this) */ test1(a: any, b: any, c: any) {
      return true;
    }

    expect(arg(test1)).toEqual(['a', 'b', 'c']);
  });

  it('test2', () => {
    function test2(a: any, b: any, c: any) /*(why do people do this??)*/ {
      return true;
    }

    expect(arg(test2)).toEqual(['a', 'b', 'c']);
  });

  it('test3', () => {
    function test3(a: any, /* (jewiofewjf,wo, ewoi, werp)*/ b: any, c: any) {
      return true;
    }

    expect(arg(test3)).toEqual(['a', 'b', 'c']);
  });

  it('test4', () => {
    function test4(a: any /* a*/, /* b */ b: any, /*c*/ c: any, d: any /*d*/) {
      return (one: any, two: any, three: any) => {
        // empty
      };
    }

    expect(arg(test4)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('test5', () => {
    function test5(a: any, b: any, c: any) {
      return false;
    }

    expect(arg(test5)).toEqual(['a', 'b', 'c']);
  });

  it('test6', () => {
    function test6(a: any) {
      return a;
    }

    expect(arg(test6)).toEqual(['a']);
  });

  it('test7', () => {
    function test7(
      /*
     function test5(
       a,
       b,
       c
     ) {
       return false;
     }
     function test5(
       a,
       b,
       c
     ) {
       return false;
     }
     function test5(
       a,
       b,
       c
     ) {
       return false;
     }
     */
      a: any,
      b: any,
      c: any,
    ) {
      return true;
    }

    expect(arg(test7)).toEqual(['a', 'b', 'c']);
  });

  it('test8', () => {
    function test8(a: any, b: any, c: any) {
      return a + b + c;
    }

    expect(arg(test8)).toEqual(['a', 'b', 'c']);
  });

  it('test9', () => {
    function π9(ƒ: any, µ: any) {
      return ƒ + µ;
    }

    expect(arg(π9)).toEqual(['ƒ', 'µ']);
  });

  it('supports ES2015 fat arrow functions with parens', () => {
    const f = (a: any, b: any) => a + b;

    expect(arg(f)).toEqual(['a', 'b']);
  });

  it('supports ES2015 fat arrow functions without parens', () => {
    const f: (a: number) => number = a => a + 2;
    expect(arg(f)).toEqual(['a']);
  });

  it('ignores ES2015 default params', () => {
    // default params supported in node.js ES6
    const f11: (a: number, b: number) => number = (a, b = 20) => a + b;

    expect(arg(f11)).toEqual(['a', 'b']);
  });

  it('supports function created using the Function constructor', () => {
    const f = new Function('a', 'b', 'return a + b');

    expect(arg(f as any)).toEqual(['a', 'b']);
  });

  it('destructor', () => {
    const f: (input: { a: number; b: number }) => number = ({ a, b }) => a + b;

    expect(arg(f)).toEqual(['{a, b}']);
  });

  it('destructor nested', () => {
    const fn: (a: any, b: any) => number = ({ a, b }, { d: { e, f } }) => a + b;

    expect(arg(fn)).toEqual(['{a, b}', '{d:{e, f}}']);
  });
});
