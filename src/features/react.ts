import type { OxlintConfig, OxlintOverride } from 'oxlint';

import { SCRIPT_EXTENSIONS } from '../constants.js';
import { jsxPlugin } from '../plugins/index.js';

/** The options of the `react` feature. */
export type ReactOptions = {
  a11y?: {
    /** A map from the name of a component to the HTML element it renders, which the `jsx-a11y` rules check it as. */
    components?: { [name: string]: string };
  };
  /** The React version, such as `'19'`. When it is absent, oxlint applies its rules as for the latest version. */
  version?: string;
};

/** The rules for components and JSX, and the plugin settings they read. */
export function react({ a11y, version }: ReactOptions): {
  overrides: OxlintOverride[];
  settings: NonNullable<OxlintConfig['settings']>;
} {
  return {
    overrides: [
      {
        files: ['**/*.{jsx,tsx}'],
        jsPlugins: [jsxPlugin],
        plugins: ['jsx-a11y', 'react'],
        // The recommended sets of eslint-plugin-react and eslint-plugin-jsx-a11y, which oxlint does not ship as
        // presets, plus the component style
        rules: {
          'jsx-a11y/alt-text': 'error',
          'jsx-a11y/anchor-ambiguous-text': 'error',
          'jsx-a11y/anchor-has-content': 'error',
          'jsx-a11y/anchor-is-valid': 'error',
          'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
          'jsx-a11y/aria-props': 'error',
          'jsx-a11y/aria-proptypes': 'error',
          'jsx-a11y/aria-role': 'error',
          'jsx-a11y/aria-unsupported-elements': 'error',
          'jsx-a11y/autocomplete-valid': 'error',
          'jsx-a11y/click-events-have-key-events': 'error',
          'jsx-a11y/control-has-associated-label': 'error',
          'jsx-a11y/heading-has-content': 'error',
          'jsx-a11y/html-has-lang': 'error',
          'jsx-a11y/iframe-has-title': 'error',
          'jsx-a11y/img-redundant-alt': 'error',
          'jsx-a11y/interactive-supports-focus': 'error',
          'jsx-a11y/label-has-associated-control': 'error',
          'jsx-a11y/lang': 'error',
          'jsx-a11y/media-has-caption': 'error',
          'jsx-a11y/mouse-events-have-key-events': 'error',
          'jsx-a11y/no-access-key': 'error',
          'jsx-a11y/no-aria-hidden-on-focusable': 'error',
          'jsx-a11y/no-autofocus': 'error',
          'jsx-a11y/no-distracting-elements': 'error',
          'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
          'jsx-a11y/no-noninteractive-element-interactions': 'error',
          'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
          'jsx-a11y/no-noninteractive-tabindex': 'error',
          'jsx-a11y/no-redundant-roles': 'error',
          'jsx-a11y/no-static-element-interactions': 'error',
          'jsx-a11y/prefer-tag-over-role': 'error',
          'jsx-a11y/role-has-required-aria-props': 'error',
          'jsx-a11y/role-supports-aria-props': 'error',
          'jsx-a11y/scope': 'error',
          'jsx-a11y/tabindex-no-positive': 'error',
          'jsx/handler-names': 'error',
          'react/button-has-type': 'error',
          'react/display-name': 'error',
          'react/function-component-definition': [
            'error',
            { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }
          ],
          'react/iframe-missing-sandbox': 'error',
          'react/jsx-boolean-value': ['error', 'never'],
          'react/jsx-curly-brace-presence': ['error', { children: 'never', props: 'never' }],
          'react/jsx-key': 'error',
          'react/jsx-no-comment-textnodes': 'error',
          'react/jsx-no-constructed-context-values': 'error',
          'react/jsx-no-duplicate-props': 'error',
          'react/jsx-no-script-url': 'error',
          'react/jsx-no-target-blank': 'error',
          'react/jsx-no-undef': 'error',
          'react/jsx-no-useless-fragment': 'error',
          'react/jsx-pascal-case': 'error',
          'react/no-children-prop': 'error',
          'react/no-danger': 'error',
          'react/no-danger-with-children': 'error',
          'react/no-direct-mutation-state': 'error',
          'react/no-find-dom-node': 'error',
          'react/no-is-mounted': 'error',
          'react/no-object-type-as-default-prop': 'error',
          'react/no-render-return-value': 'error',
          'react/no-string-refs': 'error',
          'react/no-unescaped-entities': 'error',
          'react/no-unknown-property': 'error',
          'react/no-unstable-nested-components': 'error',
          'react/require-render-return': 'error',
          'react/self-closing-comp': 'error'
        }
      },
      {
        // A hook can be written in a file without JSX
        files: [`**/*.${SCRIPT_EXTENSIONS}`],
        plugins: ['react'],
        rules: {
          'react/error-boundaries': 'error',
          'react/exhaustive-deps': 'error',
          'react/globals': 'error',
          'react/immutability': 'error',
          'react/preserve-manual-memoization': 'error',
          'react/refs': 'error',
          'react/rules-of-hooks': 'error',
          'react/set-state-in-render': 'error',
          'react/static-components': 'error',
          'react/use-memo': 'error'
        }
      }
    ],
    settings: {
      // Copied, so that a consumer who edits the result leaves the options unchanged
      ...(a11y?.components && { 'jsx-a11y': { components: { ...a11y.components } } }),
      ...(version && { react: { version } })
    }
  };
}
