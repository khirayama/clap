import { factory } from './factory';
import { CRDTDocument } from './CRDTDocument';

export function createSampleData() {
  const user = {
    id: factory.uuid(),
  };
  const member = {
    id: factory.uuid(),
  };
  const userDoc = new CRDTDocument(user.id);
  const memberDoc = new CRDTDocument(member.id, userDoc.save());
  memberDoc.change((doc) => {
    const selection = factory.selection.createSelection();
    doc.users[member.id] = selection;
  });
  userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  memberDoc.change((doc) => {
    const document = doc.document;
    const selection = doc.users[member.id];
    const firstNode = document.nodes[0];

    selection.ids.push(firstNode.id);
    selection.range = factory.selection.createRange(firstNode.inline[0].id, 0);
  });

  userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  return {
    user,
    member,
    userDoc,
    memberDoc,
  };
}
