import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { noInterface } from '../no-interface.js';

ruleTester.run('no-interface', noInterface, {
  invalid: [
    { code: 'interface Point {\n  x: number;\n}', errors: [{ messageId: 'interface' }] },
    { code: 'export interface Point {\n  x: number;\n}', errors: [{ messageId: 'interface' }] },
    {
      code: 'namespace Shapes {\n  export interface Point {\n    x: number;\n  }\n}',
      errors: [{ messageId: 'interface' }]
    }
  ],
  valid: [
    'type Point = { x: number };',
    "declare module 'library' {\n  interface Options {\n    debug: boolean;\n  }\n}",
    'declare global {\n  interface Window {\n    debug: boolean;\n  }\n}',
    { code: 'interface Point {\n  x: number;\n}', filename: 'types.d.ts' },
    { code: 'interface Point {\n  x: number;\n}', filename: 'types.d.mts' }
  ]
});
