import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { exportListOrder } from '../export-list-order.js';

ruleTester.run('export-list-order', exportListOrder, {
  invalid: [
    {
      code: 'const a = 1;\ntype B = 1;\nexport type { B };\nexport { a };',
      errors: [{ line: 4, messageId: 'order' }]
    },
    {
      code: 'const a = 1;\nconst c = 1;\ntype B = 1;\nexport type { B };\nexport { a };\nexport { c };',
      errors: [
        { line: 5, messageId: 'order' },
        { line: 6, messageId: 'order' }
      ]
    }
  ],
  valid: [
    'const a = 1;\ntype B = 1;\nexport { a };\nexport type { B };',
    // A declaration and a re-export are not lists of the module's own bindings
    "type B = 1;\nexport type { B };\nexport const a = 1;\nexport { c } from './c';",
    'const a = 1;\nexport { a };',
    // `export {}` exports nothing
    'type A = 1;\nexport type { A };\nexport {};'
  ]
});
