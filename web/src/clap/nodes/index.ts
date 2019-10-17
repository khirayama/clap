import { ItemNodePool } from './ItemNodePool';
import { PureDocumentNode, DocumentNode } from './document/DocumentNode';
import { PureParagraphNode, ParagraphNode } from './item/ParagraphNode';
import { PureHorizontalRuleNode, HorizontalRuleNode } from './item/HorizontalRuleNode';
import { PureTextContent, TextContent } from './content/TextContent';

export { ItemNodePool } from './ItemNodePool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './document/DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './item/BaseItemNode';
export { PureTextContent, TextContent } from './content/TextContent';
export { PureParagraphNode, ParagraphNode } from './item/ParagraphNode';
export { PureHorizontalRuleNode, HorizontalRuleNode } from './item/HorizontalRuleNode';

export type PureContent = PureTextContent;

export type Content = TextContent;

export type PureItemNode = PureParagraphNode | PureHorizontalRuleNode;

export type ItemNode = ParagraphNode | HorizontalRuleNode;

export type PureNode = PureDocumentNode | PureItemNode;

export type Node = DocumentNode | ItemNode;

ItemNodePool.register('paragraph', ParagraphNode);
ItemNodePool.register('horizontal-rule', HorizontalRuleNode);
