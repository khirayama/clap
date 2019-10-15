import { ItemNodePool } from './ItemNodePool';
import { PureDocumentNode, DocumentNode } from './DocumentNode';
import { PureParagraphNode, ParagraphNode } from './items/ParagraphNode';
import { PureHorizontalRuleNode, HorizontalRuleNode } from './items/HorizontalRuleNode';

export { ItemNodePool } from './ItemNodePool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
export { PureLeaf, Leaf } from './Leaf';
// items
export { PureParagraphNode, ParagraphNode } from './items/ParagraphNode';
export { PureHorizontalRuleNode, HorizontalRuleNode } from './items/HorizontalRuleNode';

export type PureNode = PureDocumentNode | PureItemNode;

export type Node = DocumentNode | ItemNode;

export type PureItemNode = PureParagraphNode | PureHorizontalRuleNode;

export type ItemNode = ParagraphNode | HorizontalRuleNode;

ItemNodePool.register('paragraph', ParagraphNode);
ItemNodePool.register('horizontal-rule', HorizontalRuleNode);
