import type { CreateRule, Definition, ESTree, Scope, Variable } from '@oxlint/plugins';

const EVENT_PROP = /^on[A-Z]/u;

const HANDLER_NAME = /^handle[A-Z]/u;

const SETTER_NAME = /^set[A-Z]/u;

/** Whether a callee names `useCallback` or `React.useCallback`. */
function isUseCallback(callee: ESTree.Expression): boolean {
  if (callee.type === 'MemberExpression') {
    return !callee.computed && callee.property.type === 'Identifier' && callee.property.name === 'useCallback';
  }
  return callee.type === 'Identifier' && callee.name === 'useCallback';
}

/** Whether a binding is a function written in this file, rather than a prop, an import or a setter. */
function isLocalFunction({ node, type }: Definition): boolean {
  if (type === 'FunctionName') {
    return true;
  }
  if (type !== 'Variable' || node.type !== 'VariableDeclarator' || node.id.type !== 'Identifier' || !node.init) {
    return false;
  }
  const { init } = node;
  const isFunction = init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression';
  return isFunction || (init.type === 'CallExpression' && isUseCallback(init.callee));
}

/** The variable that `name` refers to from `scope`. */
function resolve(scope: Scope | null, name: string): Variable | undefined {
  return scope ? (scope.set.get(name) ?? resolve(scope.upper, name)) : undefined;
}

export const handlerNames: CreateRule = {
  create(context) {
    return {
      JSXAttribute({ name, value }) {
        if (name.type !== 'JSXIdentifier' || !EVENT_PROP.test(name.name)) {
          return;
        }
        if (value?.type !== 'JSXExpressionContainer' || value.expression.type !== 'Identifier') {
          return;
        }
        const handler = value.expression.name;
        if (HANDLER_NAME.test(handler) || SETTER_NAME.test(handler)) {
          return;
        }
        const [definition] = resolve(context.sourceCode.getScope(value.expression), handler)?.defs ?? [];
        if (definition && isLocalFunction(definition)) {
          context.report({ data: { handler, prop: name.name }, messageId: 'handler', node: value.expression });
        }
      }
    };
  },
  meta: {
    docs: { description: 'Name a local function passed to an event prop `handle…`.' },
    messages: { handler: 'Name the local function passed to `{{prop}}` `handle…`, not `{{handler}}`.' },
    schema: [],
    type: 'suggestion'
  }
};
