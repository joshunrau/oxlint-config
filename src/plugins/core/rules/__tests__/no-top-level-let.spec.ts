import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { noTopLevelLet } from '../no-top-level-let.js';

ruleTester.run('no-top-level-let', noTopLevelLet, {
  invalid: [
    { code: 'let count = 0;', errors: [{ messageId: 'let' }] },
    { code: 'export let count = 0;', errors: [{ messageId: 'let' }] }
  ],
  valid: [
    'const count = 0;',
    'function next() {\n  let count = 0;\n  count += 1;\n  return count;\n}',
    'for (let index = 0; index < 3; index++) {}',
    '{\n  let scoped = 0;\n}'
  ]
});
