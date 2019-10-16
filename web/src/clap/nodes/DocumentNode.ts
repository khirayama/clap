import { PureBaseNode, BaseNode } from './BaseNode';

export interface PureDocumentNode extends PureBaseNode {}

export class DocumentNode extends BaseNode {
  constructor(node?: Partial<PureDocumentNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.object = 'document';
  }
}
