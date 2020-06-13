import * as uuid from 'uuid';

export type Decoration = 'bold' | 'italic' | 'code' | 'strike';

// Inlines
export class TextInline {
  public id: string = uuid.v4();

  public type: string;

  public text: string[];

  public marks: Decoration[];

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
