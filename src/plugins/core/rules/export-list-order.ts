import type { CreateRule } from '@oxlint/plugins';

export const exportListOrder: CreateRule = {
  create(context) {
    return {
      Program(program) {
        let hasTypeList = false;
        for (const statement of program.body) {
          // `export {}` only marks the file as a module and exports nothing
          const isList = statement.type === 'ExportNamedDeclaration' && statement.specifiers.length > 0;
          if (!isList || statement.declaration || statement.source) {
            continue;
          }
          if (statement.exportKind === 'type') {
            hasTypeList = true;
          } else if (hasTypeList) {
            context.report({ messageId: 'order', node: statement });
          }
        }
      }
    };
  },
  meta: {
    docs: { description: "Put a module's `export { … }` lists before its `export type { … }` lists." },
    messages: { order: 'Put `export { … }` before `export type { … }`.' },
    schema: [],
    type: 'suggestion'
  }
};
