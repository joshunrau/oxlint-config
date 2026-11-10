import type { OxlintConfig, OxlintEnv, OxlintOverride } from 'oxlint';

import { base } from './presets/base.js';
import { typescript } from './presets/typescript.js';

/** The argument of `config()`. Every key is optional. */
export type ConfigOptions = {
  /** Settings that apply to every file. */
  global?: {
    /**
     * The environments whose globals are defined, such as `{ browser: true, node: true }`. None is on by default;
     * the ECMAScript globals are always defined.
     */
    env?: OxlintEnv;
    /** Patterns of files that are not linted, in addition to `.vscode`, `**\/dist` and `**\/node_modules`. */
    ignore?: string[];
    /** Type-aware linting is on unless this is `false`. It needs `oxlint-tsgolint`. */
    typeAware?: boolean;
  };
  /** Raw oxlint overrides, applied after every override that `config()` generates. */
  overrides?: OxlintOverride[];
};

/** Create a complete oxlint configuration. */
export function config({ global = {}, overrides = [] }: ConfigOptions = {}): OxlintConfig {
  return {
    // oxlint's default categories and plugins are off: every rule is enabled by name in an override
    categories: { correctness: 'off' },
    env: { ...global.env },
    ignorePatterns: ['.vscode', '**/dist', '**/node_modules', ...(global.ignore ?? [])],
    options: {
      reportUnusedDisableDirectives: 'error',
      respectEslintDisableDirectives: false,
      typeAware: global.typeAware !== false
    },
    // The rule sets are copied so that a consumer who edits the result leaves later calls unchanged
    overrides: [...structuredClone(base), ...structuredClone(typescript), ...overrides],
    plugins: []
  };
}
