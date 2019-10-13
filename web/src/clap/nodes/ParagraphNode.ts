import { PureBaseItemNode, BaseItemNode } from './BaseItemNode';

type Mark = Decoration | Link;

interface Decoration {
  type: 'bold' | 'italic' | 'code' | 'strike';
}

interface Link {
  type: 'link';
  href: string;
}

interface Leaf {
  id: string;
  text: string;
  marks: Mark[];
}

export interface ParagraphNodeAttributes {
  leaves: Leaf[];
}

export interface PureParagraphNode extends PureBaseItemNode<ParagraphNodeAttributes> {}

export class ParagraphNode extends BaseItemNode<ParagraphNodeAttributes> {
  public static type: 'paragraph' = 'paragraph';

  public leaves: Leaf[] = [];

  constructor(node?: Partial<PureBaseItemNode<ParagraphNodeAttributes>>, relations?: BaseItemNode['relations']) {
    super(node, relations);

    this.leaves = node ? node.attributes.leaves || this.leaves : this.leaves;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      attributes: {
        leaves: this.leaves,
      },
    };
  }
}
