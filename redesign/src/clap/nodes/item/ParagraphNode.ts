import { PureNode, BaseItemNode, TextContent } from '../index';

export class ParagraphNode extends BaseItemNode {
  constructor(node?: Partial<PureNode>) {
    super(node);

    this.type = 'paragraph';
    if (!this.contents.length) {
      this.contents.push(new TextContent());
    }
  }

  public isParagraphNode(): this is ParagraphNode {
    return this.type === 'paragraph';
  }
}
