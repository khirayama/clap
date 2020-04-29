import * as Automerge from 'automerge';

import { CRDTDocument } from './CRDTDocument';
import { usecase } from './usecase';
import { factory } from './factory';

type Doc = ReturnType<typeof usecase.init>;

// Login
const user = {
  id: Automerge.uuid(),
};
const member = {
  id: Automerge.uuid(),
};

// [user] Create document
const userDoc: CRDTDocument = new CRDTDocument(user.id);

// [member] Join member
const memberDoc: CRDTDocument = new CRDTDocument(member.id, userDoc.save());
memberDoc.change((doc: Doc) => {
  const selection = factory.selection.createSelection();
  doc.users[member.id] = selection;
});

// [user][members] Sync from member
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
  usecase.insertText(user.id, userDoc, ['H', 'e', 'l', 'l', 'o', ' ']);
});

// [user][members] Merge
userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

console.log(JSON.stringify(userDoc, null, 2));
console.log(JSON.stringify(memberDoc, null, 2));
