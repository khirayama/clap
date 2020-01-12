import uuid from 'uuid/v4';

import * as Clap from '../index';

/* Item Mutations */
type BaseItemMutation = {
  contentMutations: ContentMutation[];
};

type RetainItemMutation = BaseItemMutation & {
  type: 'retain';
  offset: number;
};

export type ItemMutation = RetainItemMutation;

/* Content Mutations */
type BaseContentMutation = {
  textMutations: TextMutation[];
};

type RetainContentMutation = BaseContentMutation & {
  type: 'retain';
  offset: number;
};

type InsertContentMutation = BaseContentMutation & {
  type: 'insert';
  value: string;
};

type DeleteContentMutation = BaseContentMutation & {
  type: 'delete';
  count: number;
};

type AddMarkContentMutation = BaseContentMutation & {
  type: 'addmark';
  marks: Clap.TextContent['marks'];
};

type RemoveMarkContentMutation = BaseContentMutation & {
  type: 'removemark';
  marks: Clap.TextContent['marks'];
};

export type ContentMutation =
  | RetainContentMutation
  | InsertContentMutation
  | DeleteContentMutation
  | AddMarkContentMutation
  | RemoveMarkContentMutation;

/* Text Mutations */
type RetainTextMutation = {
  type: 'retain';
  offset: number;
};

type InsertTextMutation = {
  type: 'insert';
  value: string;
};

type DeleteTextMutation = {
  type: 'delete';
  count: number;
};

export type TextMutation = RetainTextMutation | InsertTextMutation | DeleteTextMutation;

const retainItemMutation: RetainItemMutation = {
  type: 'retain',
  offset: 1,
  contentMutations: [],
};

const retainContentMutation: RetainContentMutation = {
  type: 'retain',
  offset: 1,
  textMutations: [],
};

const retainTextMutation: RetainTextMutation = {
  type: 'retain',
  offset: 1,
};

type ChangesetCursor = {
  item: string; // FYI: Only item is not array.
  content: number;
  text: number;
};

export class Changeset {
  public id: string;

  public mutations: ItemMutation[] = [];

  private document: Clap.DocumentNode;

  constructor(document: Clap.DocumentNode) {
    this.id = uuid();
    this.document = document;
  }

  public transform(changeset: Changeset): Changeset {
    return /* Merget this and changeset */ changeset;
  }

  // public computeItemMutation(node: Clap.DocumentNode, itemId: string): ItemMutation {}
  // public computeContentMutation(node: Clap.DocumentNode, itemId: string, contentId: string): ItemMutation {}

  public computeTextMutation(contentId: string, textMutations: TextMutation[]): ItemMutation {
    const mutation = this.computeFullTextMutation(contentId, textMutations, this.document);
    return this.compressMutation(mutation);
  }

  private computeFullTextMutation(
    contentId: string,
    textMutations: TextMutation[],
    node: Clap.DocumentNode | Clap.ItemNode,
  ): ItemMutation {
    // 深さ優先探索して、何もなければ、itemがremain
    const mutation = { ...retainItemMutation };

    if (node.contents) {
      mutation.contentMutations = node.contents.map(content => {
        const contentMutation = { ...retainContentMutation };
        if (content.id === contentId) {
          contentMutation.textMutations = textMutations;
        } else {
          const textMutation = { ...retainTextMutation };
          textMutation.offset = content.text.length;

          contentMutation.textMutations = [textMutation];
        }

        return contentMutation;
      });
    }

    return mutation;
  }

  private compressMutation(mutation: ItemMutation) {
    // TODO: Put together retain mutations
    return mutation;
  }
}

export class ClientOperator {
  private changeset: Changeset | null = null;

  private buffer: Changeset | null = null;

  private document: Clap.DocumentNode;

  private selection: Clap.Selection;

  constructor(document: Clap.DocumentNode, selection: Clap.Selection) {
    this.document = document;
    this.selection = selection;

    this.subscribe();
  }

  public emit(changeset: Changeset) {
    this.apply(changeset);
    // if (this.changeset) {
    //   this.buffer = this.transform(changeset);
    // } else {
    //   this.changeset = changeset;
    // }
    // this.send(changeset);
  }

  private subscribe() {
    // TODO: Subscribe changeset from server and set handler
  }

  private handler(changeset: Changeset) {
    if (changeset.id === this.changeset.id) {
      this.changeset = null;
    }
    this.apply(changeset);
    if (!this.changeset && this.buffer) {
      this.send(this.buffer);
      this.buffer = null;
    }
  }

  private apply(changeset: Changeset) {
    const cursor: ChangesetCursor = {
      item: this.document.id,
      content: 0,
      text: 0,
    };
    for (const itemMutation of changeset.mutations) {
      this.applyItemMutation(itemMutation, cursor);
    }
  }

  private applyItemMutation(itemMutation: ItemMutation, cursor: ChangesetCursor) {
    cursor.content = 0;
    cursor.text = 0;

    for (const contentMutation of itemMutation.contentMutations) {
      this.applyContentMutation(contentMutation, cursor);
    }

    switch (itemMutation.type) {
      case 'retain': {
        for (let i = 0; i < itemMutation.offset; i += 1) {
          const currentNode = this.document.find(cursor.item);
          const downerNode = Clap.Exproler.findDownnerNode(currentNode);
          if (downerNode) {
            cursor.item = downerNode.id;
          }
        }
        break;
      }
    }
  }

  private applyContentMutation(contentMutation: ContentMutation, cursor: ChangesetCursor) {
    cursor.text = 0;

    for (const textMutation of contentMutation.textMutations) {
      this.applyTextMutation(textMutation, cursor);
    }

    switch (contentMutation.type) {
      case 'retain': {
        cursor.content += contentMutation.offset;
        break;
      }
    }
  }

  private applyTextMutation(textMutation: TextMutation, cursor: ChangesetCursor) {
    const document = this.document;
    const selection = this.selection;

    switch (textMutation.type) {
      case 'retain': {
        cursor.text += textMutation.offset;
        break;
      }

      case 'insert': {
        const node = document.find(cursor.item);
        const content = node.contents[cursor.content];
        const value = textMutation.value;

        // Update document
        const textArray = Array.from(content.text);
        textArray.splice(cursor.text, 0, value);
        content.text = textArray.join('');
        cursor.text += textArray.length;
        node.dispatch();

        // Update selection
        // TODO: If current user's selection match item id and content id, update selection range
        if (selection.ids.length === 1 && selection.ids[0] === cursor.item && selection.isCollasped) {
          // TODO: insertでも、他ユーザの挿入位置次第では、この通りじゃない？
          selection.range.anchor.offset = selection.range.anchor.offset + value.length;
          selection.range.focus.offset = selection.range.focus.offset + value.length;
          selection.dispatch();
        }
        break;
      }
      case 'delete': {
        const node = document.find(cursor.item);
        const content = node.contents[cursor.content];
        const count = textMutation.count;

        // Update document
        const textArray = Array.from(content.text);
        textArray.splice(cursor.text, count);
        content.text = textArray.join('');
        cursor.text += textArray.length;
        node.dispatch();

        // Update selection
        // TODO: If current user's selection match item id and content id, update selection range
        if (selection.ids.length === 1 && selection.ids[0] === cursor.item && selection.isCollasped) {
          // TODO: insertでも、他ユーザの挿入位置次第では、この通りじゃない？
          selection.range.anchor.offset = selection.range.anchor.offset - count;
          selection.range.focus.offset = selection.range.focus.offset - count;
          selection.dispatch();
        }
        break;
      }
    }
  }

  private send(changeset: Changeset) {
    console.log(changeset);
  }

  private transform(changeset: Changeset) {
    if (this.buffer) {
      return this.buffer.transform(changeset);
    } else {
      return changeset;
    }
  }
}
