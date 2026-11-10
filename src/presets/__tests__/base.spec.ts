import * as fs from 'node:fs';
import * as path from 'node:path';

import type { ExternalPluginEntry } from 'oxlint';
import { describe, expect, it } from 'vitest';

import { base } from '../base.js';

describe('base', () => {
  it('loads perfectionist by the absolute path of a file that exists', () => {
    const entry = base[0]!.jsPlugins![0] as Exclude<ExternalPluginEntry, string>;
    expect(entry.name).toBe('perfectionist');
    expect(path.isAbsolute(entry.specifier)).toBe(true);
    expect(fs.existsSync(entry.specifier)).toBe(true);
  });
});
