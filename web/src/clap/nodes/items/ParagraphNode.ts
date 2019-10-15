import { PureBaseItemNode, BaseItemNode } from '../BaseItemNode';

export interface PureParagraphNode extends PureBaseItemNode {}

export class ParagraphNode extends BaseItemNode {
  public type: 'paragraph' = 'paragraph';
}
