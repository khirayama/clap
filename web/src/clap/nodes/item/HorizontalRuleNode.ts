import { PureNode, BaseNode } from '../BaseNode';
import { BaseItemNode } from './BaseItemNode';

export class HorizontalRuleNode extends BaseItemNode {
  constructor(node?: Partial<PureNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.type = 'horizontal-rule';
    this.contents = null;
    this.nodes = null;
  }

  public isHorizontalRuleNode(): this is HorizontalRuleNode {
    return this.type === 'horizontal-rule';
  }
}
