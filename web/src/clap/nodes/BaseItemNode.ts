import { PureBaseNode, BaseNode } from './BaseNode';
import { PureLeaf, Leaf } from './Leaf';

export interface PureBaseItemNode extends PureBaseNode {
  type: 'paragraph' | 'horizontal-rule';
  leaves: PureLeaf[] | null;
}

export class BaseItemNode extends BaseNode {
  public type: PureBaseItemNode['type'];

  public leaves: Leaf[] | null = [];

  constructor(node?: Partial<PureBaseItemNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.object = 'item';
    this.leaves =
      node && node.leaves
        ? node.leaves.map((leaf: PureLeaf) => {
            return new Leaf(leaf);
          })
        : [];
  }

  public toJSON(): PureBaseItemNode {
    return {
      ...super.toJSON(),
      type: this.type,
      leaves: this.leaves ? this.leaves.map(leaf => leaf.toJSON()) : null,
    };
  }
}
