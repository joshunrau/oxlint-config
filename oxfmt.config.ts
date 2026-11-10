import { defineConfig } from 'oxfmt';

export default defineConfig({
  ignorePatterns: ['pnpm-lock.yaml'],
  printWidth: 120,
  singleQuote: true,
  sortImports: {
    groups: [
      ['value-builtin', 'type-builtin'],
      ['value-external', 'type-external'],
      ['value-internal', 'type-internal'],
      ['value-index', 'value-sibling', 'value-parent'],
      'type-import',
      'side_effect',
      'unknown'
    ]
  },
  trailingComma: 'none'
});
