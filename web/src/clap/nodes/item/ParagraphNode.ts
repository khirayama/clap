import { PureNode, BaseNode } from '../BaseNode';
import { BaseItemNode } from './BaseItemNode';

export class ParagraphNode extends BaseItemNode {
  constructor(node?: Partial<PureNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.type = 'paragraph';
  }

  public isParagraphNode(): this is ParagraphNode {
    return this.type === 'paragraph';
  }
}
