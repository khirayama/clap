import { PureBaseItemNode, BaseItemNode } from './BaseItemNode';
import { PureLeaf, Leaf } from './Leaf';

export interface PureParagraphNode extends PureBaseItemNode {
  leaves: PureLeaf[];
}

export class ParagraphNode extends BaseItemNode {
  public static type: 'paragraph' = 'paragraph';

  public leaves: Leaf[] = [];

  constructor(node?: Partial<PureParagraphNode>, relations?: BaseItemNode['relations']) {
    super(node, relations);

    this.leaves = node
      ? node.leaves.map((leaf: PureLeaf) => {
          return new Leaf(leaf);
        })
      : [];
  }

  public toJSON(): PureParagraphNode {
    return {
      ...super.toJSON(),
      leaves: this.leaves.map((leaf: Leaf) => leaf.toJSON()),
    };
  }
}
