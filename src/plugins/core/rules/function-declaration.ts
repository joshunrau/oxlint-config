import type { CreateRule, ESTree, SourceCode } from '@oxlint/plugins';

type FunctionInit = ESTree.ArrowFunctionExpression | ESTree.Function;

/** Functions that bind their own `this`, `arguments` and `new.target`, so an arrow cannot inherit them through. */
const BINDING_FUNCTIONS = new Set(['FunctionDeclaration', 'FunctionExpression']);

const LOWERCASE = /^[a-z]/u;

function isFunctionInit(init: ESTree.Expression | null): init is FunctionInit {
  return init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression';
}

/** Whether a variable declaration sits at module scope, exported or not. */
function isModuleScope({ parent }: ESTree.VariableDeclaration): boolean {
  return parent.type === 'Program' || (parent.type === 'ExportNamedDeclaration' && parent.parent.type === 'Program');
}

/** Whether the value is an AST node, as opposed to another property of one. */
function isNode(value: unknown): value is ESTree.Node {
  return typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string';
}

/** Whether a node inside an arrow reads a binding that the arrow inherits from its enclosing scope. */
function usesInheritedBinding(visitorKeys: SourceCode['visitorKeys'], node: ESTree.Node): boolean {
  const isNewTarget = node.type === 'MetaProperty' && node.meta.name === 'new';
  const isArguments = node.type === 'Identifier' && node.name === 'arguments';
  if (node.type === 'ThisExpression' || node.type === 'Super' || isNewTarget || isArguments) {
    return true;
  }
  if (BINDING_FUNCTIONS.has(node.type)) {
    return false;
  }
  return (visitorKeys[node.type] ?? []).some((key) => {
    const child: unknown = Reflect.get(node, key);
    const children: unknown[] = Array.isArray(child) ? child : [child];
    return children.some((value) => isNode(value) && usesInheritedBinding(visitorKeys, value));
  });
}

export const functionDeclaration: CreateRule = {
  create(context) {
    const { sourceCode } = context;

    /** The arrow rewritten as a function declaration. */
    function arrowToDeclaration(name: string, fn: ESTree.ArrowFunctionExpression): string {
      const arrow = sourceCode.getTokenBefore(fn.body, (token) => token.value === '=>');
      const start = fn.typeParameters ?? (fn.async ? sourceCode.getFirstToken(fn, 1) : fn);
      const header = sourceCode.text.slice(start?.range[0], arrow?.range[0]).trim();
      const signature = fn.typeParameters || header.startsWith('(') ? header : `(${header})`;
      const body =
        fn.body.type === 'BlockStatement' ? sourceCode.getText(fn.body) : `{ return ${sourceCode.getText(fn.body)}; }`;
      return `${fn.async ? 'async ' : ''}function ${name}${signature} ${body}`;
    }

    /** The function expression rewritten as a function declaration. */
    function expressionToDeclaration(name: string, fn: ESTree.Function): string {
      const start = fn.typeParameters ?? sourceCode.getFirstToken(fn, { filter: (token) => token.value === '(' });
      const rest = sourceCode.text.slice(start?.range[0], fn.range[1]);
      return `${fn.async ? 'async ' : ''}function${fn.generator ? '*' : ''} ${name}${rest}`;
    }

    /** Whether rewriting a declaration of one function loses no semantics and no comment. */
    function isFixable(declaration: ESTree.VariableDeclaration, id: ESTree.BindingIdentifier, init: FunctionInit) {
      if (declaration.kind !== 'const' || declaration.declarations.length !== 1) {
        return false;
      }
      if (init.type === 'FunctionExpression' && init.id && init.id.name !== id.name) {
        return false;
      }
      // The rewrite keeps the body's text whole but rebuilds the text around it, which would drop a comment there
      const body = init.body ?? init;
      const hasCommentOutsideBody = sourceCode.getCommentsInside(declaration).some(({ range }) => {
        return range[0] < body.range[0] || range[1] > body.range[1];
      });
      if (hasCommentOutsideBody) {
        return false;
      }
      return init.type !== 'ArrowFunctionExpression' || !usesInheritedBinding(sourceCode.visitorKeys, init.body);
    }

    return {
      VariableDeclaration(declaration) {
        if (!isModuleScope(declaration) || declaration.declare) {
          return;
        }
        for (const { id, init } of declaration.declarations) {
          if (!isFunctionInit(init) || id.type !== 'Identifier' || id.typeAnnotation || !LOWERCASE.test(id.name)) {
            continue;
          }
          const { name } = id;
          context.report({
            data: { name },
            fix: isFixable(declaration, id, init)
              ? (fixer) => {
                  const replacement =
                    init.type === 'ArrowFunctionExpression'
                      ? arrowToDeclaration(name, init)
                      : expressionToDeclaration(name, init);
                  return fixer.replaceText(declaration, replacement);
                }
              : undefined,
            messageId: 'declaration',
            node: id
          });
        }
      }
    };
  },
  meta: {
    docs: {
      description:
        'Write a module-scope function as a `function` declaration, not a `const` holding an arrow or function expression.'
    },
    fixable: 'code',
    messages: { declaration: 'Declare the module-scope function `{{name}}` with `function`.' },
    schema: [],
    type: 'suggestion'
  }
};
