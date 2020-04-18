import { Node, NodeType } from './index';

/**
 * DocumentNode > Node
 */
export class DocumentNode extends Node {
  constructor(node?: Partial<NodeType>) {
    super(node);

    this.object = 'document';
    this.type = null;
    this.inline = null;
  }
}
