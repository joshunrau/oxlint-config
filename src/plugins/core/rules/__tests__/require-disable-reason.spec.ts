import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { requireDisableReason } from '../require-disable-reason.js';

ruleTester.run('require-disable-reason', requireDisableReason, {
  invalid: [
    { code: '// oxlint-disable-next-line no-console\nconsole.log(1);', errors: [{ line: 1, messageId: 'reason' }] },
    { code: 'console.log(1); // oxlint-disable-line no-console', errors: [{ messageId: 'reason' }] },
    { code: '/* oxlint-disable no-console */', errors: [{ messageId: 'reason' }] },
    { code: '// oxlint-disable-next-line no-console --\nconsole.log(1);', errors: [{ messageId: 'reason' }] },
    { code: '// @ts-expect-error\nconst value: string = 1;', errors: [{ messageId: 'tsExpectErrorReason' }] },
    { code: '/* v8 ignore next */\nrun();', errors: [{ messageId: 'coverageReason' }] },
    { code: '/* istanbul ignore next */\nrun();', errors: [{ messageId: 'coverageReason' }] },
    { code: '/* v8 ignore next -- @preserve */\nrun();', errors: [{ messageId: 'coverageReason' }] }
  ],
  valid: [
    '// oxlint-disable-next-line no-console -- the CLI prints its result\nconsole.log(1);',
    '/* oxlint-disable no-console -- a script that only prints */',
    '// @ts-expect-error -- a number is not a string\nconst value: string = 1;',
    '/* v8 ignore next -- @preserve unreachable in tests */\nrun();',
    '/* v8 ignore start -- a platform branch */\nrun();\n/* v8 ignore stop */',
    '/* c8 ignore stop */',
    '// oxlint-enable no-console',
    '// A comment that mentions oxlint-disable in passing',
    '// eslint-disable-next-line no-console\nconsole.log(1);'
  ]
});
