import { factory } from './factory';
import { CRDTDocument } from './CRDTDocument';
import { transformation } from './transformation';
import { ParagraphNode, Heading1Node } from './node';

export function toLooseJSON(obj: any) {
  // FYI: AutomergeのCounterが、{ value: number }からnumberに変わってしまう点に注意
  return JSON.parse(JSON.stringify(obj));
}

/*
 Selection
  user
  member
 Document
  Paragraph1
    - ABCDEFGHI
    Paragraph2
      - ABCDEFGHI
      Paragraph3
        - ABC
        - DEF
        - GHI
      Paragraph4
        - ABCDEFGHI
  Paragraph5
    - ABCDEFGHI
  Paragraph6
    - ABCDEFGHI
    Paragraph7
      - ABCDEFGHI
      Paragraph8
        - ABC
        - DEF
        - GHI
  Paragraph9
    - ABCDEFGHI
  Paragraph10
    - ABCDEFGHI
    Paragraph11
      - ABCDEFGHI
      Paragraph12
        - ABC
        - DEF
        - GHI
    Paragraph13
      - ABCDEFGHI
*/

function createInlineText1() {
  const inlineText = factory.inline.createInlineText();
  inlineText.text = 'ABCDEFGHI'.split('');
  return inlineText;
}

function createInlineText2() {
  const inlineText = factory.inline.createInlineText();
  inlineText.text = 'ABC'.split('');
  return inlineText;
}

function createInlineText3() {
  const inlineText = factory.inline.createInlineText();
  inlineText.text = 'DEF'.split('');
  inlineText.marks = ['bold'];
  return inlineText;
}

function createInlineText4() {
  const inlineText = factory.inline.createInlineText();
  inlineText.text = 'GHI'.split('');
  return inlineText;
}

export function createSampleData() {
  const user = {
    id: factory.uuid(),
  };
  const member = {
    id: factory.uuid(),
  };

  const userDoc = new CRDTDocument(user.id);
  const memberDoc = new CRDTDocument(member.id, userDoc.save());

  userDoc.change((doc) => {
    const document = doc.document;

    const transform = transformation(document);

    transform.node.remove(document.nodes[0]);

    const paragraph1 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph1, createInlineText1());
    const paragraph2 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph2, createInlineText1());
    const paragraph3 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph3, createInlineText2());
    transform.node.appendInline(paragraph3, createInlineText3());
    transform.node.appendInline(paragraph3, createInlineText4());
    const paragraph4 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph4, createInlineText1());
    const paragraph5 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph5, createInlineText1());
    const paragraph6 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph6, createInlineText1());
    const paragraph7 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph7, createInlineText1());
    const paragraph8 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph8, createInlineText2());
    transform.node.appendInline(paragraph8, createInlineText3());
    transform.node.appendInline(paragraph8, createInlineText4());
    const paragraph9 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph9, createInlineText1());
    const paragraph10 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph10, createInlineText1());
    const paragraph11 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph11, createInlineText1());
    const paragraph12 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph12, createInlineText2());
    transform.node.appendInline(paragraph12, createInlineText3());
    transform.node.appendInline(paragraph12, createInlineText4());
    const paragraph13 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph13, createInlineText1());

    transform.node.append(paragraph2, paragraph3);
    transform.node.append(paragraph2, paragraph4);
    transform.node.append(paragraph1, paragraph2);
    transform.node.append(document, paragraph1);
    transform.node.append(document, paragraph5);
    transform.node.append(paragraph7, paragraph8);
    transform.node.append(paragraph6, paragraph7);
    transform.node.append(document, paragraph6);
    transform.node.append(document, paragraph9);
    transform.node.append(paragraph11, paragraph12);
    transform.node.append(paragraph10, paragraph11);
    transform.node.append(paragraph10, paragraph13);
    transform.node.append(document, paragraph10);
  });
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  userDoc.change((doc) => {
    const document = doc.document;
    const selection = doc.users[user.id];
    const firstNode = document.nodes[0] as ParagraphNode;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.selection.createRange(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  memberDoc.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.createSelection();
    const firstNode = document.nodes[0] as ParagraphNode;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.selection.createRange(firstNode.inline[0].id, firstNode.inline[0].text.length);

    doc.users[member.id] = selection;
  });
  userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));

  return {
    user,
    member,
    userDoc,
    memberDoc,
  };
}

/*
 Selection
  user
  member
 Document
  Heading1
    - ABCDEFGHI
  Paragraph1
    - ABCDEFGHI
    Heading2
      - ABCDEFGHI
*/

export function createSampleData2() {
  const user = {
    id: factory.uuid(),
  };
  const member = {
    id: factory.uuid(),
  };

  const userDoc = new CRDTDocument(user.id);
  const memberDoc = new CRDTDocument(member.id, userDoc.save());

  userDoc.change((doc) => {
    const document = doc.document;

    const transform = transformation(document);

    transform.node.remove(document.nodes[0]);

    const heading1 = factory.node.createHeading1Node();
    transform.node.appendInline(heading1, createInlineText1());
    const paragraph1 = factory.node.createParagraphNode();
    transform.node.appendInline(paragraph1, createInlineText1());
    const heading2 = factory.node.createHeading1Node();
    transform.node.appendInline(heading2, createInlineText1());

    transform.node.append(document, heading1);
    transform.node.append(paragraph1, heading2);
    transform.node.append(document, paragraph1);
  });
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  userDoc.change((doc) => {
    const document = doc.document;
    const selection = doc.users[user.id];
    const firstNode = document.nodes[0] as Heading1Node;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.selection.createRange(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  memberDoc.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.createSelection();
    const firstNode = document.nodes[0] as Heading1Node;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.selection.createRange(firstNode.inline[0].id, firstNode.inline[0].text.length);

    doc.users[member.id] = selection;
  });
  userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));

  return {
    user,
    member,
    userDoc,
    memberDoc,
  };
}
