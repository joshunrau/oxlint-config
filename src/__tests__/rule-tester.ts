import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = it;

/** A `RuleTester` that runs each case as a TypeScript module, unless the case names a file of another kind. */
export const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' }, sourceType: 'module' }
});
