import { PureBaseNode, BaseNode } from './BaseNode';
import { PureLeaf, Leaf } from './Leaf';

export interface PureBaseItemNode extends PureBaseNode {
  type: 'paragraph' | 'horizontal-rule';
  contents: PureLeaf[] | null;
}

export class BaseItemNode extends BaseNode {
  public type: PureBaseItemNode['type'];

  public contents: Leaf[] | null = [];

  constructor(node?: Partial<PureBaseItemNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.object = 'item';
    this.contents =
      node && node.contents
        ? node.contents.map((leaf: PureLeaf) => {
            return new Leaf(leaf);
          })
        : [];
  }

  public toJSON(): PureBaseItemNode {
    return {
      ...super.toJSON(),
      type: this.type,
      contents: this.contents ? this.contents.map(leaf => leaf.toJSON()) : null,
    };
  }
}
