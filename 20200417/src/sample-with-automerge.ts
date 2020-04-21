import { v4 as uuid } from 'uuid';
import * as Automerge from 'automerge';

/*--- Inline ---*/
type Decoration = 'bold' | 'italic' | 'code' | 'strike';

type InlineText = {
  id: string;
  type: 'text';
  text: string[];
  marks: Decoration[];
};

type Inline = InlineText;

/*--- Node ---*/
type SuperNode = {
  id: string;
  object: 'document' | 'item';
  type: 'paragraph' | null;
  document: string | null;
  parent: string | null;
  prev: string | null;
  next: string | null;
  inline: Inline[] | null;
  nodes: ItemNode[] | null;
};

type ParagraphNode = SuperNode & {
  object: 'item';
  type: 'paragraph';
  inline: Inline[];
  nodes: ItemNode[];
};

type ItemNode = ParagraphNode;

type DocumentNode = SuperNode & {
  object: 'document';
  type: null;
  inline: null;
  document: string;
  parent: null;
  prev: null;
  next: null;
  nodes: ItemNode[];
  meta: {
    title: string[];
  };
};

/*--- Factory ---*/
const factory = {
  node: {
    createDocumentNode: (): DocumentNode => {
      const doc: DocumentNode = {
        id: uuid(),
        object: 'document',
        type: null,
        inline: null,
        nodes: [],
        document: '',
        parent: null,
        prev: null,
        next: null,
        meta: {
          title: [],
        },
      };
      doc.document = doc.id;
      return doc;
    },
    createParagraphNode: (): ParagraphNode => {
      return {
        id: uuid(),
        object: 'item',
        type: 'paragraph',
        document: null,
        parent: null,
        prev: null,
        next: null,
        inline: [factory.inline.createInlineText()],
        nodes: [],
      };
    },
  },
  inline: {
    createInlineText: (): InlineText => {
      return {
        id: uuid(),
        type: 'text',
        text: [],
        marks: [],
      };
    },
  },
};

/*--- Transform ---*/
const transform = {
  // Add node to the last
  append: (parentNode: DocumentNode | ItemNode, node: ItemNode): void => {
    if (parentNode.nodes) {
      const prevNode = parentNode.nodes[parentNode.nodes.length - 1];

      node.document = parentNode.document;
      node.parent = parentNode.id;
      if (prevNode) {
        prevNode.next = node.id;
        node.prev = prevNode ? prevNode.id : null;
      }
      parentNode.nodes.push(node);
    }
  },
};

/*--- Traversal ---*/
const traversal = {
};

/* --- Example ---*/
// User info
const user = {
  id: uuid(),
};

// Create document
let doc = Automerge.from({ document: factory.node.createDocumentNode() }, user.id);

// Add ParagraphNode
doc = Automerge.change(doc, (doc) => {
  const paragraph = factory.node.createParagraphNode();
  transform.append(doc.document, paragraph);
});

console.log(doc);
