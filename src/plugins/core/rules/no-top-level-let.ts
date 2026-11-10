import type { CreateRule } from '@oxlint/plugins';

export const noTopLevelLet: CreateRule = {
  create(context) {
    return {
      VariableDeclaration(node) {
        const statement = node.parent.type === 'ExportNamedDeclaration' ? node.parent : node;
        if (node.kind === 'let' && statement.parent.type === 'Program') {
          context.report({ messageId: 'let', node });
        }
      }
    };
  },
  meta: {
    docs: { description: 'Declare module-level bindings with `const` and keep mutable state inside functions.' },
    messages: { let: 'Declare a module-level binding with `const`; keep mutable state inside a function.' },
    schema: [],
    type: 'suggestion'
  }
};
