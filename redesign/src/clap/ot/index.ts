import uuid from 'uuid/v4';

import * as Clap from '../index';

/* Item Mutations */
type BaseItemMutation = {
  itemMutations: ItemMutation[];
  contentMutations: ContentMutation[];
};

type RetainItemMutation = BaseItemMutation & {
  type: 'retain';
  offset: number;
};

type ItemMutation = RetainItemMutation;

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
  itemMutations: [],
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
  item: number;
  content: number;
  text: number;
};

export class Changeset {
  public id: string;

  public mutation: ItemMutation;

  private document: Clap.DocumentNode;

  constructor(document: Clap.DocumentNode) {
    this.id = uuid();
    this.mutation = {
      type: 'retain',
      offset: 1,
      itemMutations: [],
      contentMutations: [],
    };
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

    mutation.itemMutations = node.nodes.map(n => this.computeFullTextMutation(contentId, textMutations, n));

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
      item: 0,
      content: 0,
      text: 0,
    };
    this.applyItemMutation(changeset.mutation, cursor);
  }

  private applyItemMutation(itemMutation: ItemMutation, cursor: ChangesetCursor) {
    switch (itemMutation.type) {
      case 'retain': {
        // noop
        break;
      }
    }
    itemMutation.itemMutations.forEach(im => {
      this.applyItemMutation(im);
    });
    itemMutation.contentMutations.forEach(contentMutation => {
      this.applyContentMutation(contentMutation, itemMutation.id);
    });
  }

  private applyContentMutation(contentMutation: ContentMutation, itemId: string | null) {
    const document = this.document;
    const selection = this.selection;

    switch (contentMutation.type) {
      case 'retain': {
        // noop
        break;
      }
    }

    const textContext = { cursor: 0 };
    for (const textMutation of contentMutation.textMutations) {
      this.applyTextMutation(textMutation, textContext);
    }
  }

  private applyTextMutation(textMutation: TextMutation, content: { cursor: number }) {
    const document = this.document;
    const selection = this.selection;

    switch (textMutation.type) {
      case 'retain': {
        content.cursor += textMutation.offset;
        break;
      }

      case 'insert': {
        const node = document.find(itemId);
        const content = node.findContent(contentMutation.id);
        const value = textMutation.value;

        // Update document
        const textArray = content.text.split('');
        textArray.splice(context.cursor, 0, value);
        content.text = textArray.join('');
        context.cursor += content.text.length;
        node.dispatch();

        // Update selection
        // TODO: If current user's selection match item id and content id, update selection range
        if (selection.ids.length === 1 && selection.ids[0] === itemId && selection.isCollasped) {
          // TODO: insertでも、他ユーザの挿入位置次第では、この通りじゃない？
          selection.range.anchor.offset = selection.range.anchor.offset + value.length;
          selection.range.focus.offset = selection.range.focus.offset + value.length;
          selection.dispatch();
        }
        break;
      }
      case 'delete': {
        const node = document.find(itemId);
        const content = node.findContent(contentMutation.id);
        const count = textMutation.count;

        // Update document
        const textArray = content.text.split('');
        textArray.splice(context.cursor, count);
        content.text = textArray.join('');
        context.cursor += content.text.length;
        node.dispatch();

        // Update selection
        // TODO: If current user's selection match item id and content id, update selection range
        if (selection.ids.length === 1 && selection.ids[0] === itemId && selection.isCollasped) {
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
