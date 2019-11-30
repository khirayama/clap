import { PureNode, BaseNode } from '../index';

export class BaseItemNode extends BaseNode {
  constructor(node?: Partial<PureNode>) {
    super(node);

    this.object = 'item';
  }
}
