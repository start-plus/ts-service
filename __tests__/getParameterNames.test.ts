import { getParameterNames as arg } from '../src/getParameterNames';

describe('function tests', function() {
  it('test1', function() {
    function /* (no parenthesis like this) */ test1(a: any, b: any, c: any) {
      return true;
    }

    expect(arg(test1)).toEqual(['a', 'b', 'c']);
  });

  it('test2', function() {
    function test2(a: any, b: any, c: any) /*(why do people do this??)*/ {
      return true;
    }

    expect(arg(test2)).toEqual(['a', 'b', 'c']);
  });

  it('test3', function() {
    function test3(a: any, /* (jewiofewjf,wo, ewoi, werp)*/ b: any, c: any) {
      return true;
    }

    expect(arg(test3)).toEqual(['a', 'b', 'c']);
  });

  it('test4', function() {
    function test4(a: any /* a*/, /* b */ b: any, /*c*/ c: any, d: any /*d*/) {
      return function(one: any, two: any, three: any) {};
    }

    expect(arg(test4)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('test5', function() {
    function test5(a: any, b: any, c: any) {
      return false;
    }

    expect(arg(test5)).toEqual(['a', 'b', 'c']);
  });

  it('test6', function() {
    function test6(a: any) {
      return function f6(a: any, b: any) {};
    }

    expect(arg(test6)).toEqual(['a']);
  });

  it('test7', function() {
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

  it('test8', function() {
    function test8(a: any, b: any, c: any) {}

    expect(arg(test8)).toEqual(['a', 'b', 'c']);
  });

  it('test9', function() {
    function π9(ƒ: any, µ: any) {}

    expect(arg(π9)).toEqual(['ƒ', 'µ']);
  });

  it('supports ES2015 fat arrow functions with parens', function() {
    var f = (a: any, b: any) => a + b;

    expect(arg(f)).toEqual(['a', 'b']);
  });

  it('supports ES2015 fat arrow functions without parens', function() {
    var f: (a: number) => number = a => a + 2;
    expect(arg(f)).toEqual(['a']);
  });

  it('ignores ES2015 default params', function() {
    // default params supported in node.js ES6
    var f11: (a: number, b: number) => number = (a, b = 20) => a + b;

    expect(arg(f11)).toEqual(['a', 'b']);
  });

  it('supports function created using the Function constructor', function() {
    var f = new Function('a', 'b', 'return a + b');

    expect(arg(f)).toEqual(['a', 'b']);
  });

  it('destructor', function() {
    var f: (input: { a: number; b: number }) => number = ({ a, b }) => a + b;

    expect(arg(f)).toEqual(['{a, b}']);
  });

  it('destructor nested', function() {
    var f: (a: any, b: any) => number = ({ a, b }, { d: { e, f } }) => a + b;

    expect(arg(f)).toEqual(['{a, b}', '{d:{e, f}}']);
  });
});
