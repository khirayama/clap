import uuid from 'uuid/v4';

export interface LeafProperties {
  id: string;
  object: 'leaf';
  text: string;
  marks: ('bold' | 'italic' | 'code')[];
}

export class Leaf {
  public id: LeafProperties['id'];

  public object: LeafProperties['object'] = 'leaf';

  public text: LeafProperties['text'] = '';

  public marks: LeafProperties['marks'] = [];

  constructor(leaf: Partial<LeafProperties>) {
    this.id = leaf.id || uuid();
    this.text = leaf.text || this.text;
    this.marks = leaf.marks || this.marks;
  }

  public toJSON(): LeafProperties {
    return {
      id: this.id,
      object: this.object,
      text: this.text,
      marks: this.marks,
    };
  }
}
