import * as fs from 'node:fs';

import type { ExternalPluginEntry } from 'oxlint';
import { describe, expect, it } from 'vitest';

import { react } from '../react.js';

describe('react', () => {
  it('runs `jsx/handler-names` on JSX files, from the built jsx plugin', () => {
    const [jsx] = react({}).overrides;
    const entry = jsx?.jsPlugins?.[0] as Exclude<ExternalPluginEntry, string> | undefined;
    expect(jsx?.files).toStrictEqual(['**/*.{jsx,tsx}']);
    expect(jsx?.rules?.['jsx/handler-names']).toBe('error');
    expect(entry?.name).toBe('jsx');
    expect(fs.existsSync(entry?.specifier ?? '')).toBe(true);
  });

  it('sets only the settings whose options are given', () => {
    expect(react({}).settings).toStrictEqual({});
    expect(react({ version: '18.3' }).settings).toStrictEqual({ react: { version: '18.3' } });
    expect(react({ a11y: { components: { Link: 'a' } } }).settings).toStrictEqual({
      'jsx-a11y': { components: { Link: 'a' } }
    });
  });

  it('copies the components of the options into the settings', () => {
    const components = { Link: 'a' };
    const settings = react({ a11y: { components } }).settings['jsx-a11y'] as { components: unknown };
    expect(settings.components).toStrictEqual(components);
    expect(settings.components).not.toBe(components);
  });
});
