import { PureBaseItemNode, BaseItemNode } from '../BaseItemNode';

export interface PureHorizontalRuleNode extends PureBaseItemNode {}

export class HorizontalRuleNode extends BaseItemNode {
  public type: 'horizontal-rule' = 'horizontal-rule';
}
