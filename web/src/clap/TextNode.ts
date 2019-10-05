import { LeafProperties, Leaf} from './Leaf';

export interface TextProperties {
  object: 'text';
  leaves: LeafProperties[];
}
export class TextNode {
  public object: TextProperties['object'];

  public leaves: Leaf[];

  constructor(text: TextProperties) {
    this.object = text.object;
    this.leaves = text.leaves.map((leaf) => {
      return new Leaf(leaf);
    });
  }

  public toJSON(): TextProperties {
    return {
      object: this.object,
      leaves: this.leaves.map((leaf) => leaf.toJSON()),
    };
  }
}
