import { Node, NodeType } from './index';

/**
 * HorizontalRuleNode > Node
 */
export class HorizontalRuleNode extends Node {
  constructor(node?: Partial<NodeType>) {
    super(node);

    this.type = 'horizontalrule';
  }
}
