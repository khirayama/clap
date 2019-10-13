import uuid from 'uuid/v4';

type Mark = Decoration | Link;

interface Decoration {
  type: 'bold' | 'italic' | 'code' | 'strike';
}

interface Link {
  type: 'link';
  href: string;
}

export interface PureLeaf {
  id: string;
  text: string;
  marks: Mark[];
}

export class Leaf {
  public id: PureLeaf['id'];

  public text: PureLeaf['text'] = '';

  public marks: PureLeaf['marks'] = [];

  constructor(leaf: Partial<PureLeaf>) {
    this.id = leaf ? leaf.id || uuid() : uuid();
    this.text = leaf ? leaf.text || '' : '';
  }

  public toJSON(): PureLeaf {
    return {
      id: this.id,
      text: this.text,
      marks: this.marks,
    };
  }
}
