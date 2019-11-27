import { PureNode, BaseNode } from '../BaseNode';

export class BaseItemNode extends BaseNode {
  constructor(node?: Partial<PureNode>) {
    super(node);

    this.object = 'item';
  }
}
