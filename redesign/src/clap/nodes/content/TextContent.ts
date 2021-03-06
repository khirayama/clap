import uuid from 'uuid/v4';

import * as Clap from '../../';

type Mark = Decoration | Link;

interface Decoration {
  type: 'bold' | 'italic' | 'code' | 'strike';
}

// TODO: Migrate Link as Inline
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

  public parent: Clap.BaseNode | null = null;

  public next: TextContent | null = null;

  public prev: TextContent | null = null;

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
