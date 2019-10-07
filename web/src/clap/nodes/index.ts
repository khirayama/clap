import { ItemPool } from './ItemPool';
import { PureDocumentNode, DocumentNode } from './DocumentNode';
import { PureParagraphItemNode, ParagraphItemNode } from './ParagraphItemNode';

export { ItemPool } from './ItemPool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
export { PureParagraphItemNode, ParagraphItemNode } from './ParagraphItemNode';

export type PureNode = PureDocumentNode | PureItemNode;

export type PureItemNode = PureParagraphItemNode;

export type Node = DocumentNode | ItemNode;

export type ItemNode = ParagraphItemNode;

ItemPool.register(ParagraphItemNode);
