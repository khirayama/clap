import { PureNode, BaseNode } from '../BaseNode';
import { BaseItemNode } from './BaseItemNode';
import { TextContent } from '../content/TextContent';

export class ParagraphNode extends BaseItemNode {
  constructor(node?: Partial<PureNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.type = 'paragraph';
    this.contents.push(new TextContent());
  }

  public isParagraphNode(): this is ParagraphNode {
    return this.type === 'paragraph';
  }
}
