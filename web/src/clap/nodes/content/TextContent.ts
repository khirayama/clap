import uuid from 'uuid/v4';

type Mark = Decoration | Link;

interface Decoration {
  type: 'bold' | 'italic' | 'code' | 'strike';
}

interface Link {
  type: 'link';
  href: string;
}

export interface PureTextContent {
  id: string;
  object: 'text';
  text: string;
  marks: Mark[];
}

export class TextContent {
  public id: PureTextContent['id'];

  public object: PureTextContent['object'] = 'text';

  public text: PureTextContent['text'] = '';

  public marks: PureTextContent['marks'] = [];

  constructor(text?: Partial<PureTextContent>) {
    this.id = text ? text.id || uuid() : uuid();
    this.text = text ? text.text || '' : '';
    this.marks = text ? text.marks || [] : [];
  }

  public toJSON(): PureTextContent {
    return {
      id: this.id,
      object: this.object,
      text: this.text,
      marks: this.marks,
    };
  }
}
