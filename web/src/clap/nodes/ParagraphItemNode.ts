import { PureBaseItemNode, BaseItemNode } from './BaseItemNode';

export interface ParagraphItemNodeAttributes {
  text: string;
}

export interface PureParagraphItemNode extends PureBaseItemNode<ParagraphItemNodeAttributes> {}

export class ParagraphItemNode extends BaseItemNode<ParagraphItemNodeAttributes> {
  public static type: 'paragraph' = 'paragraph';

  public text: string = '';

  constructor(node: PureBaseItemNode<ParagraphItemNodeAttributes>) {
    super(node);

    this.text = node.attributes.text;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      attributes: {
        text: this.text,
      },
    };
  }
}
