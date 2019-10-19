import { PureNode, BaseNode } from '../BaseNode';

export class DocumentNode extends BaseNode {
  constructor(node?: Partial<PureNode>) {
    super(node);

    this.object = 'document';
    this.type = 'document';
    this.contents = null;
  }
}
