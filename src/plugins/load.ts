import * as url from 'node:url';

import type { ExternalPluginEntry } from 'oxlint';

/**
 * The entry of a plugin of this package, by the absolute path of its built file in `dist`. This file is two folders
 * below the package root both as `src/plugins/load.ts` and as `dist/plugins/load.js`, so the path is the same from
 * either.
 */
export function loadBuiltPlugin(name: string): ExternalPluginEntry {
  return { name, specifier: url.fileURLToPath(new URL(`../../dist/plugins/${name}/index.js`, import.meta.url)) };
}
