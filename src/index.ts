import type { OxlintConfig, OxlintEnv, OxlintOverride } from 'oxlint';

import { react } from './features/react.js';
import { vitest } from './features/vitest.js';
import { base } from './presets/base.js';
import { typescript } from './presets/typescript.js';

import type { ReactOptions } from './features/react.js';
import type { VitestOptions } from './features/vitest.js';

/** The argument of `config()`. Every key is optional. */
export type ConfigOptions = {
  /** Features, each on when its key is present. `true` turns a feature on with its defaults. */
  features?: {
    /** The rules for components and JSX. */
    react?: ReactOptions | true;
    /** The rules for test files. */
    vitest?: true | VitestOptions;
  };
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

/** The options of a feature that is on, with `true` read as no options. */
function optionsOf<T extends object>(value: T | true): Partial<T> {
  return value === true ? {} : value;
}

/** Create a complete oxlint configuration. */
export function config({ features = {}, global = {}, overrides = [] }: ConfigOptions = {}): OxlintConfig {
  // The rule sets are copied so that a consumer who edits the result leaves later calls unchanged
  const generated = [...structuredClone(base), ...structuredClone(typescript)];
  let settings: NonNullable<OxlintConfig['settings']> = {};
  // A falsy value from an untyped caller, such as `react: isApp && {…}`, leaves the feature off
  if (features.react) {
    const feature = react(optionsOf(features.react));
    generated.push(...feature.overrides);
    settings = feature.settings;
  }
  if (features.vitest) {
    generated.push(...vitest(optionsOf(features.vitest)));
  }
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
    overrides: [...generated, ...overrides],
    plugins: [],
    settings
  };
}
