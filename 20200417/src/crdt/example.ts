import { v4 as uuid } from 'uuid';
import * as Automerge from 'automerge';

import { factory } from './factory';
import { transform } from './transform';

const traversal = {};

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
