import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { functionDeclaration } from '../function-declaration.js';

ruleTester.run('function-declaration', functionDeclaration, {
  invalid: [
    {
      code: 'const double = (value: number): number => value * 2;',
      errors: [{ column: 6, data: { name: 'double' }, messageId: 'declaration' }],
      output: 'function double(value: number): number { return value * 2; }'
    },
    {
      code: 'export const run = async () => {\n  await start();\n};',
      errors: [{ messageId: 'declaration' }],
      output: 'export async function run() {\n  await start();\n}'
    },
    {
      code: 'const identity = <T,>(value: T) => value;',
      errors: [{ messageId: 'declaration' }],
      output: 'function identity<T,>(value: T) { return value; }'
    },
    {
      code: 'const negate = value => !value;',
      errors: [{ messageId: 'declaration' }],
      filename: 'negate.js',
      output: 'function negate(value) { return !value; }'
    },
    {
      code: 'const sum = function (a: number, b: number) {\n  return a + b;\n};',
      errors: [{ messageId: 'declaration' }],
      output: 'function sum(a: number, b: number) {\n  return a + b;\n}'
    },
    {
      code: 'const ids = function* () {\n  yield 1;\n};',
      errors: [{ messageId: 'declaration' }],
      output: 'function* ids() {\n  yield 1;\n}'
    },
    {
      code: 'const sum = function sum(a: number, b: number) {\n  return a + b;\n};',
      errors: [{ messageId: 'declaration' }],
      output: 'function sum(a: number, b: number) {\n  return a + b;\n}'
    },
    // Each of these is reported with no fix, since the rewrite would change what the code does or drop a comment
    {
      code: 'let double = (value: number) => value * 2;',
      errors: [{ messageId: 'declaration' }],
      output: null
    },
    {
      code: 'const double = (value: number) => value * 2, half = (value: number) => value / 2;',
      errors: [{ messageId: 'declaration' }, { messageId: 'declaration' }],
      output: null
    },
    {
      code: 'const sum = function add(a: number, b: number) {\n  return a + b;\n};',
      errors: [{ messageId: 'declaration' }],
      output: null
    },
    {
      code: 'const self = () => this;',
      errors: [{ messageId: 'declaration' }],
      output: null
    },
    {
      code: 'const run = /* the entry */ () => start();',
      errors: [{ messageId: 'declaration' }],
      output: null
    },
    {
      code: 'const get = () => /* cached */ value;',
      errors: [{ messageId: 'declaration' }],
      output: null
    },
    {
      code: 'const scale = async /* by ten */ (value: number) => value * 10;',
      errors: [{ messageId: 'declaration' }],
      output: null
    },
    // A comment inside a block body is kept with the body
    {
      code: 'const run = () => {\n  // the entry\n  start();\n};',
      errors: [{ messageId: 'declaration' }],
      output: 'function run() {\n  // the entry\n  start();\n}'
    }
  ],
  valid: [
    'function double(value: number) {\n  return value * 2;\n}',
    // A typed binding names the type that the function satisfies
    'const handler: Handler = () => {};',
    // An uppercase name is a component or a constructor, which keeps its own conventions
    'const Button = () => null;',
    'function outer() {\n  const inner = () => 1;\n  return inner();\n}',
    'const value = compute();',
    'declare const run: () => void;',
    'const { pick } = helpers;'
  ]
});
