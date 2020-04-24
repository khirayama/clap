import * as Automerge from 'automerge';

import { factory } from './factory';
import { transform } from './transform';

type Doc = ReturnType<typeof factory.utils.init>;

// Login
const user = {
  id: Automerge.uuid(),
};

// [user] Create document
let userDoc: Automerge.Doc<Doc> = Automerge.from(factory.utils.init(user.id), user.id);
let savedUserDoc = Automerge.save(userDoc);

// [member] Join member
const member = {
  id: Automerge.uuid(),
};

let memberDoc: Automerge.Doc<Doc> = Automerge.load(savedUserDoc, member.id);
memberDoc = Automerge.change(memberDoc, (memberDoc: Doc) => {
  const selection = factory.selection.createSelection();
  memberDoc.users[member.id] = selection;
});
let savedMemberDoc = Automerge.save(memberDoc);

// [user][members] Merge
let memberDocForUser: Automerge.Doc<Doc> = Automerge.load(savedMemberDoc, member.id);
userDoc = Automerge.merge(userDoc, memberDocForUser);
let userDocForMember: Automerge.Doc<Doc> = Automerge.load(savedUserDoc, user.id);
memberDoc = Automerge.merge(memberDoc, userDocForMember);

// [member] Focus on first inline
memberDoc = Automerge.change(memberDoc, (memberDoc: Doc) => {
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
savedMemberDoc = Automerge.save(memberDoc);

// [user][members] Merge
memberDocForUser = Automerge.load(savedMemberDoc, member.id);
userDoc = Automerge.merge(userDoc, memberDocForUser);
userDocForMember = Automerge.load(savedUserDoc, user.id);
memberDoc = Automerge.merge(memberDoc, userDocForMember);

// [user] Insert text by user
userDoc = Automerge.change(userDoc, (userDoc) => {
  transform.util.insertText(user.id, userDoc.users, userDoc.document, ['H', 'e', 'l', 'l', 'o', ' ']);
});
savedUserDoc = Automerge.save(userDoc);

// [user][members] Merge
memberDocForUser = Automerge.load(savedMemberDoc, member.id);
userDoc = Automerge.merge(userDoc, memberDocForUser);
userDocForMember = Automerge.load(savedUserDoc, user.id);
memberDoc = Automerge.merge(memberDoc, userDocForMember);

console.log(JSON.stringify(userDoc, null, 2));
console.log(JSON.stringify(memberDoc, null, 2));
