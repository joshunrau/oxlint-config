import type { OxlintOverride } from 'oxlint';

import { SCRIPT_EXTENSIONS } from '../constants.js';

/** The options of the `vitest` feature. */
export type VitestOptions = {
  /** Patterns of the test files. The default is the files that vitest runs by default. */
  files?: string[];
};

/** The rules for test files. */
export function vitest({ files = [`**/*.{test,spec}.${SCRIPT_EXTENSIONS}`] }: VitestOptions): OxlintOverride[] {
  return [
    {
      files,
      plugins: ['vitest'],
      rules: {
        // A test table or a fixture builder often takes more arguments than production code should
        'max-params': 'off',
        'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
        'vitest/no-conditional-in-test': 'error',
        'vitest/require-to-throw-message': 'error',
        'vitest/require-top-level-describe': 'error'
      }
    },
    {
      // A type test is only type-checked, never run, and a conditional narrows to reach the type in each branch. The
      // default `files` leaves type tests out, as vitest does; this applies when `files` names them.
      files: ['**/*.{test,spec}-d.{ts,tsx,mts,cts}'],
      plugins: ['vitest'],
      rules: {
        'vitest/no-conditional-in-test': 'off'
      }
    }
  ];
}
