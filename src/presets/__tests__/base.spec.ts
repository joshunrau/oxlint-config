import * as fs from 'node:fs';
import * as path from 'node:path';

import type { ExternalPluginEntry } from 'oxlint';
import { describe, expect, it } from 'vitest';

import { base } from '../base.js';

describe('base', () => {
  it('loads each plugin by the absolute path of a file that exists', () => {
    const entries = base[0]!.jsPlugins as Exclude<ExternalPluginEntry, string>[];
    expect(entries.map(({ name }) => name)).toStrictEqual(['core', 'perfectionist']);
    for (const { specifier } of entries) {
      expect(path.isAbsolute(specifier)).toBe(true);
      expect(fs.existsSync(specifier)).toBe(true);
    }
  });
});
