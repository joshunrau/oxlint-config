import type { Plugin } from '@oxlint/plugins';

import { handlerNames } from './rules/handler-names.js';

const plugin: Plugin = {
  meta: { name: 'jsx' },
  rules: {
    'handler-names': handlerNames
  }
};

export default plugin;
