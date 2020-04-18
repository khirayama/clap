import uuid from 'uuid';

import { ItemNode, DocumentNode, nodeMap } from '../nodes/index';

export type InlineType = ReturnType<Inline['toJSON']>;

interface Decoration {
  type: 'bold' | 'italic' | 'code' | 'strike';
}

/**
 * Inline
 * public id
 * public type
 * public text
 * public marks
 * public parent
 * public next
 * public prev
 * public toJSON()
 */
export abstract class Inline {
  public id: string;

  public type: 'text' | 'link' = 'text';

  public text: string = '';

  public marks: Decoration[] = [];

  public parent: DocumentNode | ItemNode | null = null;

  public next: Inline | null = null;

  public prev: Inline | null = null;

  constructor(inline?: Partial<InlineType>) {
    this.id = inline ? inline.id || uuid.v4() : uuid.v4();
    this.type = inline ? inline.type || this.type : this.type;
    this.marks = inline ? inline.marks || this.marks : this.marks;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      text: this.text,
      marks: this.marks,
    };
  }
}
