import { PureNode, BaseNode } from '../BaseNode';

export class BaseItemNode extends BaseNode {
  constructor(node?: Partial<PureNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.object = 'item';
  }
}
