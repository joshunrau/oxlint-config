import type { CreateRule } from '@oxlint/plugins';

/** The body types that may span more than one line. */
const LITERAL_BODY_TYPES = new Set([
  'ArrayExpression',
  'JSXElement',
  'JSXFragment',
  'ObjectExpression',
  'TemplateLiteral'
]);

export const multilineArrowBody: CreateRule = {
  create(context) {
    const { sourceCode } = context;
    return {
      ArrowFunctionExpression(node) {
        const { body } = node;
        if (body.type === 'BlockStatement' || LITERAL_BODY_TYPES.has(body.type)) {
          return;
        }
        const arrow = sourceCode.getTokenBefore(body, (token) => token.value === '=>');
        if (arrow?.loc.end.line === body.loc.end.line) {
          return;
        }
        // The parentheses around the body are replaced along with it
        let [start, end] = body.range;
        let before = sourceCode.getTokenBefore(body);
        let after = sourceCode.getTokenAfter(body);
        while (before?.value === '(' && after?.value === ')') {
          [start, end] = [before.range[0], after.range[1]];
          before = sourceCode.getTokenBefore(before);
          after = sourceCode.getTokenAfter(after);
        }
        // The fix keeps the body's text, so a comment between the body and its parentheses would be lost
        const dropsComment = sourceCode.getAllComments().some(({ range }) => {
          const isReplaced = range[0] >= start && range[1] <= end;
          return isReplaced && (range[0] < body.range[0] || range[1] > body.range[1]);
        });
        context.report({
          fix: dropsComment
            ? undefined
            : (fixer) => fixer.replaceTextRange([start, end], `{ return ${sourceCode.getText(body)}; }`),
          messageId: 'block',
          node: body
        });
      }
    };
  },
  meta: {
    docs: { description: 'When an arrow body spans more than one line, make it a literal or a block with `return`.' },
    fixable: 'code',
    messages: { block: 'An arrow body that spans more than one line must be a literal, or use a block with `return`.' },
    schema: [],
    type: 'suggestion'
  }
};
