import { describe, expect, it } from 'vitest';

import { vitest } from '../vitest.js';

describe('vitest', () => {
  it('covers the files that vitest runs by default', () => {
    expect(vitest({})[0]?.files).toStrictEqual(['**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']);
  });

  it('covers the files of `files` instead, when it is given', () => {
    expect(vitest({ files: ['test/**'] })[0]?.files).toStrictEqual(['test/**']);
  });

  it('turns `max-params` off in the test files', () => {
    expect(vitest({})[0]?.rules?.['max-params']).toBe('off');
  });
});
