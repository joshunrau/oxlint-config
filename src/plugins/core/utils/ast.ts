import type { ESTree } from '@oxlint/plugins';

/** Whether a module declaration is `declare module '…'` or `declare global`, not a `namespace` type container. */
export function isAugmentation(node: ESTree.TSGlobalDeclaration | ESTree.TSModuleDeclaration): boolean {
  return node.kind === 'global' || node.id.type === 'Literal';
}
