import { ItemNodePool } from './ItemNodePool';
import { DocumentNode } from './document/DocumentNode';
import { ParagraphNode } from './item/ParagraphNode';
import { HorizontalRuleNode } from './item/HorizontalRuleNode';
import { PureTextContent, TextContent } from './content/TextContent';

export { ItemNodePool } from './ItemNodePool';
export { PureNode, BaseNode } from './BaseNode';
export { DocumentNode } from './document/DocumentNode';
export { BaseItemNode } from './item/BaseItemNode';
export { PureTextContent, TextContent } from './content/TextContent';
export { ParagraphNode } from './item/ParagraphNode';
export { HorizontalRuleNode } from './item/HorizontalRuleNode';

export type PureContent = PureTextContent;

export type Content = TextContent;

export type ItemNode = ParagraphNode | HorizontalRuleNode;

export type Node = DocumentNode | ItemNode;

ItemNodePool.register('paragraph', ParagraphNode);
ItemNodePool.register('horizontal-rule', HorizontalRuleNode);
