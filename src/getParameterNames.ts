/*
 From
 https://github.com/goatslacker/get-parameter-names
 and 
 https://www.npmjs.com/package/@avejidah/get-parameter-names
 */

var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
var DEFAULT_PARAMS = /=[^,]+/gm;
var FAT_ARROWS = /=>.*$/gm;
var SPACES = /\s/gm;
var BEFORE_OPENING_PAREN = /^[^(]*\(/gm;
var AFTER_CLOSING_PAREN = /^([^)]*)\).*$/gm;

function joinDestructors(args: string[]) {
  let count = 0;
  const ret: string[] = [];
  let current: string[] = [];
  args.forEach(param => {
    if (param.includes('{')) {
      count++;
      current.push(param);
    } else if (param.includes('}')) {
      count--;
      current.push(param);
      if (!count) {
        ret.push(current.join(', '));
        current = [];
      }
    } else {
      ret.push(param);
    }
  });
  return ret;
}

export function getParameterNames(fn: Function) {
  var code = fn
    .toString()
    .replace(SPACES, '')
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '')
    .replace(BEFORE_OPENING_PAREN, '')
    .replace(AFTER_CLOSING_PAREN, '$1');

  return joinDestructors(code ? code.split(',') : []);
}
