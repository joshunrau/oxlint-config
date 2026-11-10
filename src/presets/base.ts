import * as url from 'node:url';

import type { OxlintOverride } from 'oxlint';

const PERFECTIONIST_NATURAL = { order: 'asc', type: 'natural' };

/** The rules for every JavaScript and TypeScript file. */
export const base: OxlintOverride[] = [
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    // A dependency of this package, so it is loaded by its absolute path rather than resolved from the consumer
    jsPlugins: [
      {
        name: 'perfectionist',
        specifier: url.fileURLToPath(import.meta.resolve('eslint-plugin-perfectionist'))
      }
    ],
    plugins: ['import', 'unicorn'],
    rules: {
      'array-callback-return': 'error',
      'constructor-super': 'error',
      curly: ['error', 'all'],
      'default-case-last': 'error',
      eqeqeq: 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/exports-last': 'error',
      'import/no-cycle': 'error',
      'import/no-duplicates': 'error',
      'logical-assignment-operators': 'error',
      'max-depth': ['error', { max: 4 }],
      'max-params': ['error', { max: 3 }],
      'no-alert': 'error',
      'no-async-promise-executor': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-constructor-return': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-else-return': ['error', { allowElseIf: true }],
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-empty-static-block': 'error',
      'no-eval': 'error',
      'no-ex-assign': 'error',
      'no-extend-native': 'error',
      'no-extra-boolean-cast': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-global-assign': 'error',
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-lonely-if': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-nested-ternary': 'error',
      'no-new-func': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-obj-calls': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-promise-executor-return': 'error',
      'no-prototype-builtins': 'error',
      'no-redeclare': 'error',
      'no-regex-spaces': 'error',
      'no-return-assign': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-setter-return': 'error',
      'no-shadow-restricted-names': 'error',
      'no-sparse-arrays': 'error',
      'no-template-curly-in-string': 'error',
      'no-this-before-super': 'error',
      'no-unassigned-vars': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'error',
      'no-useless-assignment': 'error',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-with': 'error',
      'object-shorthand': 'error',
      'operator-assignment': 'error',
      'perfectionist/sort-array-includes': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-classes': [
        'error',
        {
          ...PERFECTIONIST_NATURAL,
          groups: [
            'index-signature',
            'static-property',
            'property',
            'private-property',
            'constructor',
            'static-method',
            'static-private-method',
            ['get-method', 'set-method'],
            'method',
            'private-method',
            'unknown'
          ]
        }
      ],
      'perfectionist/sort-decorators': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-enums': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-exports': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-heritage-clauses': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-interfaces': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-intersection-types': ['error', { ...PERFECTIONIST_NATURAL, groups: ['named', 'unknown'] }],
      'perfectionist/sort-jsx-props': [
        'error',
        {
          ...PERFECTIONIST_NATURAL,
          customGroups: [
            {
              elementNamePattern: '^on.+',
              groupName: 'callback'
            }
          ],
          groups: ['shorthand-prop', 'unknown', 'callback']
        }
      ],
      'perfectionist/sort-maps': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-modules': [
        'error',
        {
          ...PERFECTIONIST_NATURAL,
          // Non-exported before exported, as `import/exports-last` requires
          groups: [
            ['enum', 'interface', 'type'],
            'class',
            'function',
            'export-function',
            'export-class',
            ['export-enum', 'export-interface', 'export-type']
          ],
          newlinesBetween: 1,
          newlinesInside: 1,
          // A section banner (`// ----`) bounds the declarations sorted with each other
          partitionByComment: { line: String.raw`^\s*[-=]{10,}\s*$` }
        }
      ],
      'perfectionist/sort-named-exports': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-named-imports': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-object-types': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-objects': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-sets': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-union-types': ['error', PERFECTIONIST_NATURAL],
      'perfectionist/sort-variable-declarations': ['error', PERFECTIONIST_NATURAL],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-object-has-own': 'error',
      'prefer-template': 'error',
      'preserve-caught-error': 'error',
      radix: 'error',
      'require-yield': 'error',
      'symbol-description': 'error',
      'unicorn/no-process-exit': 'error',
      'unicorn/prefer-import-meta-properties': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-structured-clone': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      yoda: 'error'
    }
  }
];
