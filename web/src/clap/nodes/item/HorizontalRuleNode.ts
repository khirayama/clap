import { PureBaseItemNode, BaseItemNode } from './BaseItemNode';

export interface PureHorizontalRuleNode extends PureBaseItemNode {}

export class HorizontalRuleNode extends BaseItemNode {
  constructor(node?: Partial<PureHorizontalRuleNode>, relations?: BaseItemNode['relations']) {
    super(node, relations);

    this.type = 'horizontal-rule';
    this.contents = null;
    this.nodes = null;
  }
}
