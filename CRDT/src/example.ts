import { Doc } from './interfaces';
import { CRDTDocument } from './CRDTDocument';
import { actions } from './actions';
import { factory } from './factory';

// Login
const user = {
  id: factory.uuid(),
};
const member = {
  id: factory.uuid(),
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

  if (firstNode.type !== 'paragraph') return;

  selection.anchor = firstNode.id;
  selection.focus = firstNode.id;
  selection.range = factory.selection.createRange(firstNode.inline[0].id, 0);
});

// [user][members] Merge
userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

// [user] Insert text by user
userDoc.change((userDoc) => {
  actions(user.id, userDoc).insertText(['H', 'e', 'l', 'l', 'o', ' ']);
});

// [user][members] Merge
userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));
