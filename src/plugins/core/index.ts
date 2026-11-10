import type { Plugin } from '@oxlint/plugins';

import { exportListOrder } from './rules/export-list-order.js';
import { functionDeclaration } from './rules/function-declaration.js';
import { multilineArrowBody } from './rules/multiline-arrow-body.js';
import { noInterface } from './rules/no-interface.js';
import { noSwitch } from './rules/no-switch.js';
import { noTopLevelLet } from './rules/no-top-level-let.js';
import { nodeNamespaceImport } from './rules/node-namespace-import.js';
import { requireDisableReason } from './rules/require-disable-reason.js';

const plugin: Plugin = {
  meta: {
    name: 'core'
  },
  rules: {
    'export-list-order': exportListOrder,
    'function-declaration': functionDeclaration,
    'multiline-arrow-body': multilineArrowBody,
    'no-interface': noInterface,
    'no-switch': noSwitch,
    'no-top-level-let': noTopLevelLet,
    'node-namespace-import': nodeNamespaceImport,
    'require-disable-reason': requireDisableReason
  }
};

export default plugin;
