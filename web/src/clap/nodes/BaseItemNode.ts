import { PureBaseNode, BaseNode } from './BaseNode';
import { PureLeaf, Leaf } from './Leaf';

export interface PureBaseItemNode extends PureBaseNode {
  type: 'paragraph' | 'horizontal-rule';
  leaves: PureLeaf[];
}

export class BaseItemNode extends BaseNode {
  public static type: PureBaseItemNode['type'];

  public type: PureBaseItemNode['type'];

  public leaves: Leaf[] = [];

  constructor(node?: Partial<PureBaseItemNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.leaves = node
      ? node.leaves.map((leaf: PureLeaf) => {
          return new Leaf(leaf);
        })
      : [];
  }

  public toJSON(): PureBaseItemNode {
    return {
      ...super.toJSON(),
      type: this.type,
      leaves: this.leaves.map(leaf => leaf.toJSON()),
    };
  }
}
