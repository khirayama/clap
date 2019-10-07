import { ItemPool } from './ItemPool';
import { PureDocumentNode, DocumentNode } from './DocumentNode';
import { PureParagraphNode, ParagraphNode } from './ParagraphNode';

export { ItemPool } from './ItemPool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
export { PureParagraphNode, ParagraphNode } from './ParagraphNode';

export type PureNode = PureDocumentNode | PureItemNode;

export type PureItemNode = PureParagraphNode;

export type Node = DocumentNode | ItemNode;

export type ItemNode = ParagraphNode;

ItemPool.register(ParagraphNode);
