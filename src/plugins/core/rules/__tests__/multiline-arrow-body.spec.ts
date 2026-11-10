import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { multilineArrowBody } from '../multiline-arrow-body.js';

ruleTester.run('multiline-arrow-body', multilineArrowBody, {
  invalid: [
    {
      code: 'const total = (items: number[]) =>\n  items.reduce((sum, item) => sum + item, 0);',
      errors: [{ line: 2, messageId: 'block' }],
      output: 'const total = (items: number[]) =>\n  { return items.reduce((sum, item) => sum + item, 0); };'
    },
    {
      code: 'const run = () => (\n  start()\n);',
      errors: [{ messageId: 'block' }],
      output: 'const run = () => { return start(); };'
    },
    // A body that starts on the `=>` line still spans more than one line
    {
      code: 'const check = (value: number) => value > 0 &&\n  value < 10;',
      errors: [{ messageId: 'block' }],
      output: 'const check = (value: number) => { return value > 0 &&\n  value < 10; };'
    },
    {
      code: 'const create = () => make({\n  a: 1\n});',
      errors: [{ messageId: 'block' }],
      output: 'const create = () => { return make({\n  a: 1\n}); };'
    },
    // The fix would drop the comment inside the parentheses, so none is offered
    {
      code: 'const run = () => (\n  // the entry\n  start()\n);',
      errors: [{ messageId: 'block' }],
      output: null
    }
  ],
  valid: [
    'const double = (value: number) => value * 2;',
    'const run = () => {\n  start();\n};',
    'const point = () => ({\n  x: 1\n});',
    'const list = () => [\n  1\n];',
    'const text = () => `\n  line\n`;',
    { code: 'const view = () => (\n  <div />\n);', filename: 'view.tsx' }
  ]
});
