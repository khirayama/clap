export interface LeafProperties {
  object: 'leaf';
  text: string;
  marks: ('bold' | 'italic' | 'code')[];
}

export class Leaf {
  public object: LeafProperties['object'];

  public text: LeafProperties['text'];

  public marks: LeafProperties['marks'];

  constructor(leaf: LeafProperties) {
    this.object = leaf.object;
    this.text = leaf.text;
    this.marks = leaf.marks;
  }

  public toJSON(): LeafProperties {
    return {
      object: this.object,
      text: this.text,
      marks: this.marks,
    };
  }
}
