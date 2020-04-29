import * as Automerge from 'automerge';

import { factory } from './factory';
import { transform } from './transform';
import { CRDTDocument } from './CRDTDocument';

type Doc = ReturnType<typeof factory.utils.init>;

// Login
const user = {
  id: Automerge.uuid(),
};

// [user] Create document
let userDoc = new CRDTDocument(user.id);

// [member] Join member
const member = {
  id: Automerge.uuid(),
};

let memberDoc = new CRDTDocument(member.id, userDoc.save());
memberDoc.change((doc: Doc) => {
  const selection = factory.selection.createSelection();
  doc.users[member.id] = selection;
});

// [user][members] Merge
userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

// [member] Focus on first inline
memberDoc.change((memberDoc: Doc) => {
  const document = memberDoc.document;
  const selection = memberDoc.users[member.id];
  const firstNode = document.nodes[0];

  selection.ids.push(firstNode.id);
  selection.range = {
    anchor: {
      id: firstNode.inline[0].id,
      offset: new Automerge.Counter(0),
    },
    focus: {
      id: firstNode.inline[0].id,
      offset: new Automerge.Counter(0),
    },
  };
});

// [user][members] Merge
userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

// [user] Insert text by user
userDoc.change((userDoc) => {
  transform.util.insertText(user.id, userDoc.users, userDoc.document, ['H', 'e', 'l', 'l', 'o', ' ']);
});

// [user][members] Merge
userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

console.log(JSON.stringify(userDoc, null, 2));
console.log(JSON.stringify(memberDoc, null, 2));
