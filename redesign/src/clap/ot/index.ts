import uuid from 'uuid/v4';

import * as Clap from '../index';

// TODO: 設計し直し。配列じゃなくfunction chainで。
/* Item Mutations */
type BaseItemMutation = {
  id: string | null;
  type: string;
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
  id: string | null;
  type: 'retain' | 'insert' | 'delete' | 'addmark' | 'removemark';
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

type ContentMutation =
  | RetainContentMutation
  | InsertContentMutation
  | DeleteContentMutation
  | AddMarkContentMutation
  | RemoveMarkContentMutation;

/* Text Mutations */
type BaseTextMutation = {
  type: 'retain' | 'insert' | 'delete';
};

type RetainTextMutation = BaseTextMutation & {
  type: 'retain';
  offset: number;
};

type InsertTextMutation = BaseTextMutation & {
  type: 'insert';
  value: string;
};

type DeleteTextMutation = BaseTextMutation & {
  type: 'delete';
  count: number;
};

type TextMutation = RetainTextMutation | InsertTextMutation | DeleteTextMutation;

export class Changeset {
  public id: string;

  public mutation: ItemMutation;

  constructor(node: Clap.DocumentNode | Clap.ItemNode) {
    this.id = uuid();
    this.mutation = this.computeMutation(node);
  }

  public transform(changeset: Changeset): Changeset {
    return /* Merget this and changeset */ changeset;
  }

  public findItemMutation(id: string, mutation: ItemMutation = this.mutation): ItemMutation | null {
    if (mutation.id === id) {
      return mutation;
    } else if (mutation.itemMutations) {
      for (const itemMutation of mutation.itemMutations) {
        const result = this.findItemMutation(id, itemMutation);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  public computeMutation(node: Clap.DocumentNode | Clap.ItemNode): ItemMutation {
    const retainItemMutation: RetainItemMutation = {
      id: null,
      type: 'retain',
      offset: 1,
      itemMutations: [],
      contentMutations: [],
    };

    const retainContentMutation: RetainContentMutation = {
      id: null,
      type: 'retain',
      offset: 1,
      textMutations: [],
    };

    const retainTextMutation: RetainTextMutation = {
      type: 'retain',
      offset: 1,
    };

    const mutation = { ...retainItemMutation, id: node.id };

    if (node.contents) {
      mutation.contentMutations = node.contents.map(content => {
        const contentMutation = { ...retainContentMutation, id: content.id };
        const textMutation = { ...retainTextMutation };
        textMutation.offset = content.text.length;

        contentMutation.textMutations = [textMutation];

        return contentMutation;
      });
    }

    mutation.itemMutations = node.nodes.map(n => this.computeMutation(n));

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
    this.applyItemMutation(changeset.mutation);
  }

  private applyItemMutation(itemMutation: ItemMutation) {
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

    let cursor = 0;
    contentMutation.textMutations.forEach(textMutation => {
      switch (textMutation.type) {
        case 'retain': {
          cursor += textMutation.offset;
          break;
        }
        case 'insert': {
          const node = document.find(itemId);
          const content = node.findContent(contentMutation.id);
          const value = textMutation.value;

          // Update document
          const textArray = content.text.split('');
          textArray.splice(cursor, 0, value);
          content.text = textArray.join('');
          cursor += content.text.length;
          node.dispatch();

          // Update selection
          // TODO: If current user's selection match item id and content id, update selection range
          if (
            selection.ids.length === 1 &&
            selection.ids[0] === itemId &&
            selection.isCollasped &&
            selection.range.anchor.id === contentMutation.id
          ) {
            // TODO: insertでも、他ユーザの挿入位置次第では、この通りじゃない？
            selection.range.anchor.offset = selection.range.anchor.offset + value.length;
            selection.range.focus.offset = selection.range.focus.offset + value.length;
            selection.dispatch();
          }
          break;
        }
      }
    });
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
