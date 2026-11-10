import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { noSwitch } from '../no-switch.js';

ruleTester.run('no-switch', noSwitch, {
  invalid: [
    {
      code: 'switch (value) {\n  case 1:\n    break;\n}',
      errors: [{ column: 0, line: 1, messageId: 'switch' }]
    }
  ],
  valid: ['if (value === 1) {}', "const label = { a: 'A', b: 'B' }[key];"]
});
