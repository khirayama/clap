import { PureBaseItemNode, BaseItemNode } from './BaseItemNode';

export interface ParagraphNodeAttributes {
  text: string;
}

export interface PureParagraphNode extends PureBaseItemNode<ParagraphNodeAttributes> {}

export class ParagraphNode extends BaseItemNode<ParagraphNodeAttributes> {
  public static type: 'paragraph' = 'paragraph';

  public text: string = '';

  constructor(node?: Partial<PureBaseItemNode<ParagraphNodeAttributes>>, relations?: BaseItemNode['relations']) {
    super(node, relations);

    this.text = node ? node.attributes.text || '' : '';
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
