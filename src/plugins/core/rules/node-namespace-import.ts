import * as module from 'node:module';

import type { CreateRule } from '@oxlint/plugins';

export const nodeNamespaceImport: CreateRule = {
  create(context) {
    return {
      ImportDeclaration(node) {
        const { importKind, source, specifiers } = node;
        // A side-effect import binds no name, so it has no other form to take
        if (importKind === 'type' || specifiers.length === 0 || !module.isBuiltin(source.value)) {
          return;
        }
        const [specifier, ...rest] = specifiers;
        if (specifier?.type !== 'ImportNamespaceSpecifier' || rest.length > 0) {
          context.report({ data: { source: source.value }, messageId: 'namespace', node });
        }
      }
    };
  },
  meta: {
    docs: { description: "Import a Node built-in as one namespace, as in `import * as fs from 'node:fs'`." },
    messages: { namespace: "Import a Node built-in as a single namespace: `import * as name from '{{source}}'`." },
    schema: [],
    type: 'suggestion'
  }
};
