import uuid from 'uuid/v4';

type Mark = Decoration | Link;

interface Decoration {
  type: 'bold' | 'italic' | 'code' | 'strike';
}

interface Link {
  type: 'link';
  href: string;
}

export interface PureText {
  id: string;
  text: string;
  marks: Mark[];
}

export class Text {
  public id: PureText['id'];

  public text: PureText['text'] = '';

  public marks: PureText['marks'] = [];

  constructor(text?: Partial<PureText>) {
    this.id = text ? text.id || uuid() : uuid();
    this.text = text ? text.text || '' : '';
    this.marks = text ? text.marks || [] : [];
  }

  public toJSON(): PureText {
    return {
      id: this.id,
      text: this.text,
      marks: this.marks,
    };
  }
}
