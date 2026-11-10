import type { CreateRule, ESTree } from '@oxlint/plugins';

import { isAugmentation } from '../utils/ast.js';

const DECLARATION_FILE = /\.d\.[cm]?ts$/u;

/** Whether the node sits inside `declare module '…'` or `declare global`. */
function isInAugmentation(node: ESTree.Node): boolean {
  for (let current = node; current.type !== 'Program'; current = current.parent) {
    if (current.type === 'TSModuleDeclaration' && isAugmentation(current)) {
      return true;
    }
  }
  return false;
}

export const noInterface: CreateRule = {
  create(context) {
    if (DECLARATION_FILE.test(context.filename)) {
      return {};
    }
    return {
      TSInterfaceDeclaration(node) {
        if (!isInAugmentation(node)) {
          context.report({ messageId: 'interface', node });
        }
      }
    };
  },
  meta: {
    docs: {
      description: 'Declare object types with `type`, keeping `interface` for declaration merging in an augmentation.'
    },
    messages: { interface: 'Use `type`; `interface` is only for declaration merging in an augmentation.' },
    schema: [],
    type: 'suggestion'
  }
};
