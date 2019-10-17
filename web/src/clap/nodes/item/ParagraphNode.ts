import { PureBaseItemNode, BaseItemNode } from './BaseItemNode';

export interface PureParagraphNode extends PureBaseItemNode {}

export class ParagraphNode extends BaseItemNode {
  constructor(node?: Partial<PureParagraphNode>, relations?: BaseItemNode['relations']) {
    super(node, relations);

    this.type = 'paragraph';
  }
}
