import * as Y from 'yjs';
import * as uuid from 'uuid';

export type Marks = {
  bold: boolean;
  italic: boolean;
  code: boolean;
  strike: boolean;
  color: string;
  background: string;
};

// Inlines
export class TextInline {
  public id: string = uuid.v4();

  public type: string;

  public text: Y.Array<string> = new Y.Array();

  public marks: Marks;

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      text: this.text,
      marks: this.marks,
    };
  }
}

export type Inline = TextInline;

// Items
export class Item {
  public id: string = uuid.v4();

  public type: string;

  public inlines: Inline[] | null;

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
      inlines: this.inlines.map((inline: Inline) => inline.toJSON()),
    };
  }
}

export class ParagraphItem extends Item {
  constructor() {
    super();

    this.inlines = [];
  }
}
