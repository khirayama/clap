import { factory } from './factory';
import { CRDTDocument } from './CRDTDocument';
import { transform } from './transform';

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
    transform.node.remove(document, document.nodes[0]);

    const paragraph1 = factory.node.createParagraphNode();
    paragraph1.inline.push(createInlineText1());
    const paragraph2 = factory.node.createParagraphNode();
    paragraph2.inline.push(createInlineText1());
    const paragraph3 = factory.node.createParagraphNode();
    paragraph3.inline.push(createInlineText2());
    paragraph3.inline.push(createInlineText3());
    paragraph3.inline.push(createInlineText4());
    const paragraph4 = factory.node.createParagraphNode();
    paragraph4.inline.push(createInlineText1());
    const paragraph5 = factory.node.createParagraphNode();
    paragraph5.inline.push(createInlineText1());
    const paragraph6 = factory.node.createParagraphNode();
    paragraph6.inline.push(createInlineText1());
    const paragraph7 = factory.node.createParagraphNode();
    paragraph7.inline.push(createInlineText1());
    const paragraph8 = factory.node.createParagraphNode();
    paragraph8.inline.push(createInlineText2());
    paragraph8.inline.push(createInlineText3());
    paragraph8.inline.push(createInlineText4());
    const paragraph9 = factory.node.createParagraphNode();
    paragraph9.inline.push(createInlineText1());
    const paragraph10 = factory.node.createParagraphNode();
    paragraph10.inline.push(createInlineText1());
    const paragraph11 = factory.node.createParagraphNode();
    paragraph11.inline.push(createInlineText1());
    const paragraph12 = factory.node.createParagraphNode();
    paragraph12.inline.push(createInlineText2());
    paragraph12.inline.push(createInlineText3());
    paragraph12.inline.push(createInlineText4());
    const paragraph13 = factory.node.createParagraphNode();
    paragraph13.inline.push(createInlineText1());

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
    const firstNode = document.nodes[0];

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.selection.createRange(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));

  memberDoc.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.createSelection();
    const firstNode = document.nodes[0];

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
