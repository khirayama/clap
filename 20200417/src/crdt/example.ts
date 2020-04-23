import { v4 as uuid } from 'uuid';
import * as Automerge from 'automerge';

import { factory } from './factory';
import { transform } from './transform';

// User info
const user = {
  id: uuid(),
};

// Create document
let doc = Automerge.from(
  {
    document: factory.node.createDocumentNode(),
    selection: factory.selection.createSelection(),
  },
  user.id,
);

// Initialize
doc = Automerge.change(doc, (doc) => {
  const paragraph = factory.node.createParagraphNode();
  transform.node.append(doc.document, paragraph);

  doc.selection.ids.push(paragraph.id);
  doc.selection.range = {
    anchor: {
      id: paragraph.inline[0].id,
      offset: new Automerge.Counter(0),
    },
    focus: {
      id: paragraph.inline[0].id,
      offset: new Automerge.Counter(0),
    },
  };
});

// Insert text
doc = Automerge.change(doc, (doc) => {
  transform.inline.insert(doc.selection, doc.document, 'H', 'e', 'l', 'l', 'o', ' ');
});

console.log(JSON.stringify(doc, null, 2));
