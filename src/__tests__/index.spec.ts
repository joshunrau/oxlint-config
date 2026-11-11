import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as url from 'node:url';

import type { OxlintConfig } from 'oxlint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { react } from '../features/react.js';
import { vitest } from '../features/vitest.js';
import { config } from '../index.js';
import { base } from '../presets/base.js';
import { typescript } from '../presets/typescript.js';

import type { ConfigOptions } from '../index.js';

type Diagnostic = { code: string; filename: string };

const OXLINT_BIN = path.join(path.dirname(url.fileURLToPath(import.meta.resolve('oxlint/package.json'))), 'bin/oxlint');

const SAMPLE = `export const value = { b: 1, a: 2 };
export const spread = [...[1, 2]];
export async function run(): Promise<void> {
  Promise.resolve();
}
export function identity(input: any): unknown {
  return input;
}
`;

const FIXTURE: Record<string, string> = {
  'generated/sample.ts': SAMPLE,
  'module.mts': 'export const value = { b: 1, a: 2 };\n',
  'sample.ts': SAMPLE,
  'scripts/build.js': 'export const build = () => 1;\n',
  'tsconfig.json': JSON.stringify({
    compilerOptions: { module: 'nodenext', noEmit: true, strict: true, target: 'ES2022' },
    include: ['**/*.ts', '**/*.mts']
  }),
  'untyped.d.ts': "declare module 'untyped' {\n  const value: any;\n  export default value;\n}\n"
};

const FEATURE_FIXTURE: Record<string, string> = {
  // A hook called conditionally, in a file without JSX
  'hooks.ts': 'export function useCount(enabled: boolean) {\n  if (enabled) {\n    useState(0);\n  }\n}\n',
  'math.spec.ts': [
    "import { describe, expect, test } from 'vitest';",
    '',
    'function add(a: number, b: number, c: number, d: number): number {',
    '  return a + b + c + d;',
    '}',
    '',
    "describe('add', () => {",
    "  test('sums', () => {",
    '    expect(add(1, 2, 3, 4)).toBe(10);',
    '  });',
    '});',
    ''
  ].join('\n'),
  'math.ts': 'export function add(a: number, b: number, c: number, d: number): number {\n  return a + b + c + d;\n}\n',
  // A local function passed to an event prop without the `handle` prefix
  'view.tsx': [
    'export const View = () => {',
    "  const save = () => console.warn('saved');",
    '  return (',
    '    <button type="button" onClick={save}>',
    '      Save',
    '    </button>',
    '  );',
    '};',
    ''
  ].join('\n')
};

/** Write a fixture into a new temporary directory, and return the directory. */
function writeFixture(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oxlint-config-'));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }
  return root;
}

/** Lint a fixture with the configuration given, and list the reported rule codes per file. */
function lint(root: string, configuration: OxlintConfig): Record<string, string[]> {
  const configFile = path.join(root, 'oxlintrc.json');
  fs.writeFileSync(configFile, JSON.stringify(configuration));
  const result = childProcess.spawnSync(process.execPath, [OXLINT_BIN, '--format', 'json', '-c', configFile, root], {
    encoding: 'utf8'
  });
  if (result.error ?? (result.status !== 0 && result.status !== 1)) {
    throw new Error(`oxlint exited with status ${result.status}: ${result.stderr}`, { cause: result.error });
  }
  const { diagnostics } = JSON.parse(result.stdout) as { diagnostics: Diagnostic[] };
  const codes: Record<string, string[]> = {};
  for (const { code, filename } of diagnostics) {
    (codes[path.relative(root, filename)] ??= []).push(code);
  }
  return codes;
}

/** The names of the rules that the configuration turns on for some file. */
function enabledRules(configuration: OxlintConfig): Set<string> {
  const names = new Set<string>();
  for (const { rules = {} } of configuration.overrides ?? []) {
    for (const [name, entry] of Object.entries(rules)) {
      const severity = Array.isArray(entry) ? entry[0] : entry;
      if (severity !== 'off' && severity !== 'allow' && severity !== 0) {
        names.add(name);
      }
    }
  }
  return names;
}

/**
 * The names under which a rule may be configured, from the code oxlint reports it by, such as
 * `typescript(no-explicit-any)`. oxlint reports a rule that a plugin shares with ESLint or with React Hooks under that
 * other plugin's name: `typescript/no-empty-function` as `eslint(no-empty-function)` and `react/rules-of-hooks` as
 * `react-hooks(rules-of-hooks)`.
 */
function ruleNames(code: string): string[] {
  const [, plugin, rule] = /^(.+)\((.+)\)$/.exec(code) ?? [];
  if (plugin === 'eslint') {
    return [rule!, `typescript/${rule}`];
  }
  return plugin === 'react-hooks' ? [`react/${rule}`] : [`${plugin}/${rule}`];
}

/** The reported codes whose rule the configuration does not enable by any of its names. */
function unexpectedCodes(configuration: OxlintConfig, codes: Record<string, string[]>): string[] {
  const enabled = enabledRules(configuration);
  return Object.values(codes)
    .flat()
    .filter((code) => !ruleNames(code).some((name) => enabled.has(name)));
}

describe('config', () => {
  it('returns both rule sets and the fixed settings when called with no argument', () => {
    expect(config()).toStrictEqual({
      categories: { correctness: 'off' },
      env: {},
      ignorePatterns: ['.vscode', '**/dist', '**/node_modules'],
      options: {
        reportUnusedDisableDirectives: 'error',
        respectEslintDisableDirectives: false,
        typeAware: true
      },
      overrides: [...base, ...typescript],
      plugins: [],
      settings: {}
    });
  });

  it('turns a feature on when its key is present, and `true` with its defaults', () => {
    expect(config({ features: {} })).toStrictEqual(config());
    // An untyped caller can pass a falsy value, which leaves the feature off
    expect(config({ features: { react: false as unknown as true } })).toStrictEqual(config());
    expect(config({ features: { react: true } })).toStrictEqual(config({ features: { react: {} } }));
    expect(config({ features: { vitest: true } }).overrides).toStrictEqual([...base, ...typescript, ...vitest({})]);
  });

  it('puts the overrides of the features after the rule sets and before `overrides`', () => {
    const override = { files: ['**/*.ts'], rules: { eqeqeq: 'off' as const } };
    const { overrides } = config({ features: { react: true, vitest: true }, overrides: [override] });
    expect(overrides).toStrictEqual([...base, ...typescript, ...react({}).overrides, ...vitest({}), override]);
  });

  it('takes the settings of the react rules from the options of `react`', () => {
    const options = { a11y: { components: { Link: 'a' } }, version: '19' };
    expect(config({ features: { react: options } }).settings).toStrictEqual({
      'jsx-a11y': { components: { Link: 'a' } },
      react: { version: '19' }
    });
    expect(config({ features: { react: true } }).settings).toStrictEqual({});
  });

  it('adds the patterns of `global.ignore` to the patterns that are always ignored', () => {
    expect(config({ global: { ignore: ['generated/**'] } }).ignorePatterns).toStrictEqual([
      '.vscode',
      '**/dist',
      '**/node_modules',
      'generated/**'
    ]);
  });

  it('defines the environments of `global.env`', () => {
    expect(config({ global: { env: { browser: true, node: false } } }).env).toStrictEqual({
      browser: true,
      node: false
    });
  });

  it('turns type-aware linting off only when `global.typeAware` is `false`', () => {
    expect(config({ global: {} }).options?.typeAware).toBe(true);
    expect(config({ global: { typeAware: true } }).options?.typeAware).toBe(true);
    expect(config({ global: { typeAware: false } }).options?.typeAware).toBe(false);
  });

  it('applies `overrides` after every generated override', () => {
    const override = { files: ['**/*.ts'], rules: { eqeqeq: 'off' as const } };
    const { overrides } = config({ overrides: [override] });
    expect(overrides?.at(-1)).toBe(override);
    expect(overrides).toHaveLength(base.length + typescript.length + 1);
  });

  it('returns a configuration that a consumer can edit without changing later results', () => {
    const first = config();
    first.overrides![0]!.rules!.eqeqeq = 'off';
    expect(config().overrides![0]!.rules!.eqeqeq).toBe('error');
  });
});

describe('the configuration under oxlint', () => {
  let root: string;

  function lintWith(options: ConfigOptions): Record<string, string[]> {
    return lint(root, config({ ...options, global: { ignore: ['generated/**'], ...options.global } }));
  }

  beforeAll(() => {
    root = writeFixture(FIXTURE);
  });

  afterAll(() => {
    fs.rmSync(root, { force: true, recursive: true });
  });

  it('runs perfectionist and the type-aware rules, and no file that is ignored', () => {
    const codes = lintWith({});
    expect(Object.keys(codes).sort()).toStrictEqual(['module.mts', 'sample.ts', 'scripts/build.js']);
    expect(codes['sample.ts']).toContain('perfectionist(sort-objects)');
    expect(codes['sample.ts']).toContain('typescript(no-floating-promises)');
    expect(codes['module.mts']).toStrictEqual(['perfectionist(sort-objects)']);
  });

  it('runs the core rules from the built plugin, on every file of the base preset', () => {
    expect(lintWith({})['scripts/build.js']).toStrictEqual(['core(function-declaration)']);
  });

  it('reports only rules that are enabled by name', () => {
    const configuration = config({ global: { ignore: ['generated/**'] } });
    const codes = lint(root, configuration);
    expect(Object.values(codes).flat().length).toBeGreaterThan(0);
    expect(unexpectedCodes(configuration, codes)).toStrictEqual([]);
  });

  it('allows `any` in a declaration file only', () => {
    const codes = lintWith({});
    expect(codes['sample.ts']).toContain('typescript(no-explicit-any)');
    expect(codes['untyped.d.ts']).toBeUndefined();
  });

  it('runs no type-aware rule when `global.typeAware` is `false`', () => {
    const codes = lintWith({ global: { typeAware: false } });
    expect(codes['sample.ts']).toContain('perfectionist(sort-objects)');
    expect(codes['sample.ts']).not.toContain('typescript(no-floating-promises)');
  });

  it('lets a rule set in `overrides` win over the rule sets', () => {
    const codes = lintWith({ overrides: [{ files: ['**/*.ts'], rules: { 'perfectionist/sort-objects': 'off' } }] });
    expect(codes['sample.ts']).not.toContain('perfectionist(sort-objects)');
  });
});

describe('the features under oxlint', () => {
  let root: string;

  // The fixture's JSX has no React types to check against
  function lintWith(features: ConfigOptions['features']): Record<string, string[]> {
    return lint(root, config({ features, global: { typeAware: false } }));
  }

  beforeAll(() => {
    root = writeFixture(FEATURE_FIXTURE);
  });

  afterAll(() => {
    fs.rmSync(root, { force: true, recursive: true });
  });

  it('runs no rule of a feature whose key is absent', () => {
    const codes = Object.values(lintWith({})).flat();
    expect(codes.filter((code) => /^(jsx|jsx-a11y|react|react-hooks|vitest)\(/u.test(code))).toStrictEqual([]);
  });

  it('runs the react rules, with the built jsx plugin on JSX files and the hook rules on every file', () => {
    const codes = lintWith({ react: true });
    expect(codes['view.tsx']).toStrictEqual(['jsx(handler-names)']);
    expect(codes['hooks.ts']).toContain('react-hooks(rules-of-hooks)');
  });

  it('runs the vitest rules on the test files only, with `max-params` off there', () => {
    const codes = lintWith({ vitest: true });
    expect(codes['math.spec.ts']).toContain('vitest(consistent-test-it)');
    expect(codes['math.spec.ts']).not.toContain('eslint(max-params)');
    expect(codes['math.ts']).toContain('eslint(max-params)');
  });

  it('runs the vitest rules on the files that `files` names', () => {
    const codes = lintWith({ vitest: { files: ['**/*.check.ts'] } });
    expect(codes['math.spec.ts']).not.toContain('vitest(consistent-test-it)');
    expect(codes['math.spec.ts']).toContain('eslint(max-params)');
  });

  it('reports only rules that are enabled by name, with every feature on', () => {
    const configuration = config({ features: { react: true, vitest: true }, global: { typeAware: false } });
    const codes = lint(root, configuration);
    expect(Object.values(codes).flat().length).toBeGreaterThan(0);
    expect(unexpectedCodes(configuration, codes)).toStrictEqual([]);
  });
});
