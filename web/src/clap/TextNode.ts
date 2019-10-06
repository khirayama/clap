import uuid from 'uuid/v4';

import { LeafProperties, Leaf } from './Leaf';

export interface TextProperties {
  id: string;
  object: 'text';
  leaves: LeafProperties[];
}
export class TextNode {
  public id: TextProperties['id'];

  public object: TextProperties['object'] = 'text';

  public leaves: Leaf[] = [];

  constructor(text: Partial<TextProperties>) {
    this.id = text.id || uuid();
    this.leaves =
      text.leaves.map(leaf => {
        return new Leaf(leaf);
      }) || this.leaves;
  }

  public toJSON(): TextProperties {
    return {
      id: this.id,
      object: this.object,
      leaves: this.leaves.map(leaf => leaf.toJSON()),
    };
  }
}
