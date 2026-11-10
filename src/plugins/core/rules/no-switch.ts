import type { CreateRule } from '@oxlint/plugins';

export const noSwitch: CreateRule = {
  create(context) {
    return {
      SwitchStatement(node) {
        context.report({ messageId: 'switch', node });
      }
    };
  },
  meta: {
    docs: { description: "Branch on a value with ts-pattern's `match(...).exhaustive()` instead of `switch`." },
    messages: { switch: 'Use ts-pattern `match(...)` with `.exhaustive()` instead of `switch`.' },
    schema: [],
    type: 'suggestion'
  }
};
