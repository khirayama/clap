import uuid from 'uuid/v4';

import * as Clap from '../index';

/* Operational Transformation *******************
 * [Google Waveの仕組み - Google Waveで遊ぼう!](http://rainbowdevil.jp/wave/googlewavearchitecture.html)
 * [Google Wave Operational Transformation](https://svn.apache.org/repos/asf/incubator/wave/whitepapers/operational-transform/operational-transform.html)
 * [Operational Transformation, the real time collaborative editing algorithm [Operations and Transformations] – Srijan Agarwal](https://www.srijanagarwal.me/2017/05/operational-transformation/)
 * [Operational Transformation, the real time collaborative editing algorithm - By](https://hackernoon.com/operational-transformation-the-real-time-collaborative-editing-algorithm-bf8756683f66)
 * [Building a real-time collaborative editor using Operational Transformation](https://medium.com/@srijancse/how-real-time-collaborative-editing-work-operational-transformation-ac4902d75682)
 * [Operational Transformation – OT Explained](https://operational-transformation.github.io/index.html)
 * [Visualization of OT with a central server – OT Explained](http://operational-transformation.github.io/visualization.html)
 * [marcelklehr/changesets: Changeset library with operational transformation -- for node and the browser!](https://github.com/marcelklehr/changesets)
 *
 Mutations on Google Wave
- retain
- insert characters
- insert element start
- insert element end
- delete characters
- delete element start
- delete element end
- replace attributes
- update attributes
- annotation boundary

// フラットな配列に対してのみ操作できるんだな、OTは -> 違いそう
// OTは、結局、「今の状態」に「どういう操作をするか」
// そして、その「操作」を「どう合成変換するか」が問題なんやな。
// なので、Mutationの構造は、今のtree構造にマッチする
// かつ、処理はシーケンシャルである
Item Mutations
- retain
- insert item
  pick item
  put item
- delete item
- update type

Content Mutations
- retain
- insert content
- delete content
- add mark
- remove mark

Text Mutations
- retain
- insert text
- delete text

// Case 1
start   : I am a *software* engineer
user1   : I am *a software engi*neer
user2   : I am a *hardware* engineer
expected: I am *a hardware engi*neer

// user1 changeset
retain 5
delete text 2

insert text 'a'
retain 8
insert text ' engi'

delete ' engi'
retain 4

// user2 changeset
retain 7

delete text 4
insert text 'hard'

retain 9

// expected changeset
retain 5
delete text 2

insert text ' a'
delete text 4
insert text 'hard'
retain 4
insert text 'engi'

delete ' engi'
retain 4


// Case 2
start   : I am a *software* engineer
user1   : I a**m a *software* engine**er
user2   : I **am a *so**ftware* engineer
expected: I **am a *software* engine**er

// user1 changeset
retain 3
delete 4

insert content
add mark
insert text 'm a '

add mark
retain 8

insert content
add mark
insert text ' engine'

delete text 7
retain 2

// user2 changeset
retain 2
delete 5

insert content
add mark
insert text 'am a '

add mark
retain 2
delete text 6

insert content
insert text 'ftware'

retain 9

// expected changeset
retain 2
delete 5

insert content
add mark
insert text 'am a '

add mark
retain 8

insert content
add mark
insert text ' engine'

delete text 7
retain 2

// Case 3
start   : I am a *software* engineer
user1   : I **am a *software* engine**er
user2   : I am a good *software* engineer
expected: I **am a good *software* engine**er

// user1 changeset
retain 2
delete text 5

insert content
add mark
insert text 'am a '

add mark
retain 8

insert content
add mark
insert text ' engine'

delete text 7
retain 2

// user2 changeset
retain 7
insert text 'good '

retain 8

retain 9

// expected changeset
retain 2
delete text 5

insert content
add mark
insert text 'am a '
insert text 'good '

add mark
retain 8

insert content
add mark
insert text ' engine'

delete text 7
retain 2
 ************************************************/

/* Item Mutations */
type BaseItemMutation = {
  id: string;
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
  id: string;
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
      id: '',
      type: 'retain',
      offset: 1,
      itemMutations: [],
      contentMutations: [],
    };

    const retainContentMutation: RetainContentMutation = {
      id: '',
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
    console.log(changeset);
    // update document and selection
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
