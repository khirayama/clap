import { ItemNodePool } from './ItemNodePool';
import { PureDocumentNode, DocumentNode } from './DocumentNode';
import { PureParagraphNode, ParagraphNode } from './items/ParagraphNode';
import { PureHorizontalRuleNode, HorizontalRuleNode } from './items/HorizontalRuleNode';
import { PureTextContent, TextContent } from './TextContent';

export { ItemNodePool } from './ItemNodePool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
export { PureTextContent, TextContent } from './TextContent';
// items
export { PureParagraphNode, ParagraphNode } from './items/ParagraphNode';
export { PureHorizontalRuleNode, HorizontalRuleNode } from './items/HorizontalRuleNode';

export type PureContent = PureTextContent;

export type Content = TextContent;

export type PureItemNode = PureParagraphNode | PureHorizontalRuleNode;

export type ItemNode = ParagraphNode | HorizontalRuleNode;

export type PureNode = PureDocumentNode | PureItemNode;

export type Node = DocumentNode | ItemNode;

ItemNodePool.register('paragraph', ParagraphNode);
ItemNodePool.register('horizontal-rule', HorizontalRuleNode);
