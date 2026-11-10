import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as url from 'node:url';

import type { OxlintConfig } from 'oxlint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

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

/** The name under which a rule is configured, from the code oxlint reports it by, such as `typescript(no-explicit-any)`. */
function ruleName(code: string): string {
  const [, plugin, rule] = /^(.+)\((.+)\)$/.exec(code) ?? [];
  return plugin === 'eslint' ? rule! : `${plugin}/${rule}`;
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
      plugins: []
    });
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

  /** Lint the fixture with the configuration given, and list the reported rule codes per file. */
  function lint(configuration: OxlintConfig): Record<string, string[]> {
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

  function lintWith(options: ConfigOptions): Record<string, string[]> {
    return lint(config({ ...options, global: { ignore: ['generated/**'], ...options.global } }));
  }

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'oxlint-config-'));
    for (const [name, content] of Object.entries(FIXTURE)) {
      fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
      fs.writeFileSync(path.join(root, name), content);
    }
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
    const enabled = enabledRules(configuration);
    const reported = Object.values(lint(configuration)).flat().map(ruleName);
    expect(reported.length).toBeGreaterThan(0);
    expect(reported.filter((name) => !enabled.has(name))).toStrictEqual([]);
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
