// document
import { DocumentNode } from './document/DocumentNode';
// item
import { ParagraphNode } from './item/ParagraphNode';
import { HorizontalRuleNode } from './item/HorizontalRuleNode';
// content
import { PureTextContent, TextContent } from './content/TextContent';

export { ClassPool } from './ClassPool';
export { PureNode, BaseNode } from './BaseNode';
// document
export { DocumentNode } from './document/DocumentNode';
// item
export { BaseItemNode } from './item/BaseItemNode';
export { ParagraphNode } from './item/ParagraphNode';
export { HorizontalRuleNode } from './item/HorizontalRuleNode';
// content
export { PureTextContent, TextContent } from './content/TextContent';
// utils
export { Exproler } from './Exproler';

export type PureContent = PureTextContent;

export type Content = TextContent;

export type ItemNode = ParagraphNode | HorizontalRuleNode;

export type Node = DocumentNode | ItemNode;
