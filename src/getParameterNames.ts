/*
 From
 https://github.com/goatslacker/get-parameter-names
 and
 https://www.npmjs.com/package/@avejidah/get-parameter-names
 */

const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const DEFAULT_PARAMS = /=[^,]+/gm;
const FAT_ARROWS = /=>.*$/gm;
const SPACES = /\s/gm;
const BEFORE_OPENING_PAREN = /^[^(]*\(/gm;
const AFTER_CLOSING_PAREN = /^([^)]*)\).*$/gm;

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

export function getParameterNames(fn: (...args: any[]) => any) {
  const code = fn
    .toString()
    .replace(SPACES, '')
    .replace(COMMENTS, '')
    .replace(FAT_ARROWS, '')
    .replace(DEFAULT_PARAMS, '')
    .replace(BEFORE_OPENING_PAREN, '')
    .replace(AFTER_CLOSING_PAREN, '$1');

  return joinDestructors(code ? code.split(',') : []);
}
