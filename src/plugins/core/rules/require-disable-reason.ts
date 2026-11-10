import type { CreateRule } from '@oxlint/plugins';

// oxlint splits a directive comment from its reason at this separator
const REASON_SEPARATOR = /\s-{2,}\s/u;

// Bundlers strip comments before coverage runs unless they carry `@preserve`, so it does not count as a reason
const PRESERVE_MARKER = /@preserve\b/gu;

/** Each directive comment that must state a reason, with the message it reports. */
const DIRECTIVES = [
  { messageId: 'reason', pattern: /^\s*oxlint-disable(?:-line|-next-line)?(?:\s|$)/u },
  { messageId: 'tsExpectErrorReason', pattern: /^[\s*]*@ts-expect-error(?:\s|$)/u },
  // The `stop` that closes an ignored range has nothing to justify; its `start` carries the reason
  { messageId: 'coverageReason', pattern: /^[\s*]*(?:c8|istanbul|v8)\s+ignore(?!\s+stop\b)(?:\s|$)/u }
];

/** The text of a comment after the reason separator, or an empty string. */
function reasonOf(value: string): string {
  const separator = REASON_SEPARATOR.exec(value);
  const reason = separator ? value.slice(separator.index + separator[0].length) : '';
  return reason.replace(PRESERVE_MARKER, '').trim();
}

export const requireDisableReason: CreateRule = {
  create(context) {
    return {
      Program() {
        for (const { loc, value } of context.sourceCode.getAllComments()) {
          const directive = DIRECTIVES.find(({ pattern }) => pattern.test(value));
          if (directive && !reasonOf(value)) {
            context.report({ loc, messageId: directive.messageId });
          }
        }
      }
    };
  },
  meta: {
    docs: {
      description:
        'Follow every lint-disable, coverage-ignore and `@ts-expect-error` directive with `--` and the reason.'
    },
    messages: {
      coverageReason: 'State why the code is excluded from coverage: `/* v8 ignore next -- <reason> */`.',
      reason: 'State why the rule is disabled: `// oxlint-disable-next-line <rule> -- <reason>`.',
      tsExpectErrorReason: 'State the error the line is meant to raise: `// @ts-expect-error -- <reason>`.'
    },
    schema: [],
    type: 'suggestion'
  }
};
