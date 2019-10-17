import { ItemNodePool } from './ItemNodePool';
import { PureDocumentNode, DocumentNode } from './DocumentNode';
import { PureParagraphNode, ParagraphNode } from './items/ParagraphNode';
import { PureHorizontalRuleNode, HorizontalRuleNode } from './items/HorizontalRuleNode';
import { PureText, Text } from './Text';

export { ItemNodePool } from './ItemNodePool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
export { PureText, Text } from './Text';
// items
export { PureParagraphNode, ParagraphNode } from './items/ParagraphNode';
export { PureHorizontalRuleNode, HorizontalRuleNode } from './items/HorizontalRuleNode';

export type PureContent = PureText;

export type Content = Text;

export type PureItemNode = PureParagraphNode | PureHorizontalRuleNode;

export type ItemNode = ParagraphNode | HorizontalRuleNode;

export type PureNode = PureDocumentNode | PureItemNode;

export type Node = DocumentNode | ItemNode;

ItemNodePool.register('paragraph', ParagraphNode);
ItemNodePool.register('horizontal-rule', HorizontalRuleNode);
