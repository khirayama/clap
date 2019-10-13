import { ItemNodePool } from './ItemNodePool';
import { PureDocumentNode, DocumentNode } from './DocumentNode';
import { PureParagraphNode, ParagraphNode } from './ParagraphNode';

export { ItemNodePool } from './ItemNodePool';
export { PureBaseNode, BaseNode } from './BaseNode';
export { PureDocumentNode, DocumentNode } from './DocumentNode';
export { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
export { PureParagraphNode, ParagraphNode } from './ParagraphNode';
export { PureLeaf, Leaf } from './Leaf';

export type PureNode = PureDocumentNode | PureItemNode;

export type Node = DocumentNode | ItemNode;

export type PureItemNode = PureParagraphNode;

export type ItemNode = ParagraphNode;

ItemNodePool.register(ParagraphNode);
