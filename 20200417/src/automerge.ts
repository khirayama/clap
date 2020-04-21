import { v4 as uuid } from 'uuid';
import * as Automerge from 'automerge';

type Decoration = 'bold' | 'italic' | 'code' | 'strike';

type InlineText = {
  id: string;
  type: 'text';
  text: string[];
  marks: Decoration[];
};

type Inline = InlineText;

type ParagraphNode = {
  id: string;
  object: 'item';
  type: 'paragraph';
  inline: Inline[];
  nodes: ItemNode[];
};

type ItemNode = ParagraphNode;

type DocNode = {
  id: string;
  object: 'document';
  type: null;
  nodes: ItemNode[];
  meta: {
    title: string[];
  };
};

const sampleDocument: DocNode = {
  meta: {
    title: ['D', 'o', 'c', 'u', 'm', 'e', 'n', 't', ' ', 'T', 'i', 't', 'l', 'e'],
  },
  id: uuid(),
  object: 'document',
  type: null,
  nodes: [
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      nodes: [],
      inline: [
        {
          id: uuid(),
          type: 'text',
          text: ['H', 'e', 'l', 'l', 'o'],
          marks: [],
        },
      ],
    },
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      nodes: [],
      inline: [
        {
          id: uuid(),
          type: 'text',
          text: ['W', 'o', 'x', 'l', 'd'],
          marks: ['italic'],
        },
      ],
    },
  ],
};

let doc1 = Automerge.from({ doc: sampleDocument });

doc1 = Automerge.change(doc1, 'Update document title', (doc) => {
  doc.doc.meta.title.splice(0, 0, ...'Updated '.split(''));
});

// let doc2 = Automerge.from({ doc: JSON.parse(JSON.stringify(doc1.doc)) });
let doc2 = Automerge.init();
// doc2 = Automerge.merge(doc2, JSON.parse(JSON.stringify(doc1)));
doc2 = Automerge.merge(doc2, doc1);

doc1 = Automerge.change(doc1, 'Add new node', (doc) => {
  doc.doc.nodes.push({
    id: uuid(),
    object: 'item',
    type: 'paragraph',
    nodes: [],
    inline: [
      {
        id: uuid(),
        type: 'text',
        text: ['!', '!', '!'],
        marks: [],
      },
    ],
  });
});
doc1 = Automerge.change(doc1, 'Fix typo and add style', (doc) => {
  doc.doc.nodes[1].inline[0].text.splice(2, 1);
  doc.doc.nodes[1].inline[0].text.splice(2, 0, ...'aaa'.split(''));
  doc.doc.nodes[1].inline[0].marks.push('bold');
});
doc1 = Automerge.change(doc1, 'Fix typo and add style', (doc) => {
  doc.doc.nodes[1].inline[0].text.splice(2, 1);
});
doc2 = Automerge.change(doc2, 'Update new document title', (doc: any) => {
  doc.doc.meta.title.splice(0, 0, ...'New '.split(''));
  doc.doc.nodes.splice(0, 1);
});
// console.log(JSON.stringify(doc1, null, 2));
// console.log('--- final doc ---');
// console.log(JSON.stringify(finalDoc, null, 2));
// const savedDoc = Automerge.save(finalDoc);
// const loadedDoc = Automerge.load(savedDoc);
// console.log(savedDoc);
// console.log(JSON.stringify(loadedDoc, null, 2));

// class SampleDocument {
//   public id: string;
//
//   constructor() {
//     this.id = uuid();
//   }
//
//   public toJSON() {
//     return {
//       id: this.id,
//     };
//   }
// }
//
// const userId = uuid();
// let doc = Automerge.from(new SampleDocument(), userId);
// doc = Automerge.change(doc, 'Update', (dc: ReturnType<SampleDocument['toJSON']>) => {
//   console.log(dc === doc, dc === dc, doc === doc);
// });
// const serializedDoc = Automerge.save(doc);
// const loadedDoc = Automerge.load(serializedDoc, userId);
// console.log(Object.keys(loadedDoc));
// // const traverser = new Traverser(loadedDoc);
