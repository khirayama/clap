import { PureNode, BaseNode, NodeRelation } from '../BaseNode';

export class BaseItemNode extends BaseNode {
  constructor(node?: Partial<PureNode>, relations?: NodeRelation) {
    super(node, relations);

    this.object = 'item';
  }
}
