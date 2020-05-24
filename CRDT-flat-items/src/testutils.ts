import { factory } from './factory';
import { BoardHandler } from './BoardHandler';
import { transformation } from './transformation';
import { ParagraphItem, Heading1Item } from './structures';

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
    - ABCDEFGHI*
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

  const userDoc = new BoardHandler(user.id);
  const memberDoc = new BoardHandler(member.id, userDoc.save());

  userDoc.change((doc) => {
    const document = doc.document;

    const transform = transformation(document);

    transform.item.remove(document.items[0]);

    const paragraph1 = factory.item.createParagraph();
    transform.item.appendInline(paragraph1, createInlineText1());
    const paragraph2 = factory.item.createParagraph();
    paragraph2.indent.increment(1);
    transform.item.appendInline(paragraph2, createInlineText1());
    const paragraph3 = factory.item.createParagraph();
    paragraph3.indent.increment(2);
    transform.item.appendInline(paragraph3, createInlineText2());
    transform.item.appendInline(paragraph3, createInlineText3());
    transform.item.appendInline(paragraph3, createInlineText4());
    const paragraph4 = factory.item.createParagraph();
    paragraph4.indent.increment(2);
    transform.item.appendInline(paragraph4, createInlineText1());
    const paragraph5 = factory.item.createParagraph();
    transform.item.appendInline(paragraph5, createInlineText1());
    const paragraph6 = factory.item.createParagraph();
    transform.item.appendInline(paragraph6, createInlineText1());
    const paragraph7 = factory.item.createParagraph();
    paragraph7.indent.increment(1);
    transform.item.appendInline(paragraph7, createInlineText1());
    const paragraph8 = factory.item.createParagraph();
    paragraph8.indent.increment(2);
    transform.item.appendInline(paragraph8, createInlineText2());
    transform.item.appendInline(paragraph8, createInlineText3());
    transform.item.appendInline(paragraph8, createInlineText4());
    const paragraph9 = factory.item.createParagraph();
    transform.item.appendInline(paragraph9, createInlineText1());
    const paragraph10 = factory.item.createParagraph();
    transform.item.appendInline(paragraph10, createInlineText1());
    const paragraph11 = factory.item.createParagraph();
    paragraph11.indent.increment(1);
    transform.item.appendInline(paragraph11, createInlineText1());
    const paragraph12 = factory.item.createParagraph();
    paragraph12.indent.increment(2);
    transform.item.appendInline(paragraph12, createInlineText2());
    transform.item.appendInline(paragraph12, createInlineText3());
    transform.item.appendInline(paragraph12, createInlineText4());
    const paragraph13 = factory.item.createParagraph();
    paragraph13.indent.increment(1);
    transform.item.appendInline(paragraph13, createInlineText1());

    transform.item.append(paragraph1);
    transform.item.append(paragraph2);
    transform.item.append(paragraph3);
    transform.item.append(paragraph4);
    transform.item.append(paragraph5);
    transform.item.append(paragraph6);
    transform.item.append(paragraph7);
    transform.item.append(paragraph8);
    transform.item.append(paragraph9);
    transform.item.append(paragraph10);
    transform.item.append(paragraph11);
    transform.item.append(paragraph12);
    transform.item.append(paragraph13);
  });
  memberDoc.merge(userDoc.save(), user.id);

  userDoc.change((doc) => {
    const document = doc.document;
    const selection = doc.users[user.id];
    const firstNode = document.items[0] as ParagraphItem;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberDoc.merge(userDoc.save(), user.id);

  memberDoc.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.create();
    const firstNode = document.items[0] as ParagraphItem;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);

    doc.users[member.id] = selection;
  });
  memberDoc.merge(userDoc.save(), user.id);

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

  const userDoc = new BoardHandler(user.id);
  const memberDoc = new BoardHandler(member.id, userDoc.save());

  userDoc.change((doc) => {
    const document = doc.document;

    const transform = transformation(document);

    transform.item.remove(document.items[0]);

    const heading1 = factory.item.createHeading1();
    transform.item.appendInline(heading1, createInlineText1());
    const paragraph1 = factory.item.createParagraph();
    transform.item.appendInline(paragraph1, createInlineText1());
    const heading2 = factory.item.createHeading1();
    heading2.indent.increment(1);
    transform.item.appendInline(heading2, createInlineText1());

    transform.item.append(heading1);
    transform.item.append(paragraph1);
    transform.item.append(heading2);
  });
  memberDoc.merge(userDoc.save(), user.id);

  userDoc.change((doc) => {
    const document = doc.document;
    const selection = doc.users[user.id];
    const firstNode = document.items[0] as Heading1Item;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberDoc.merge(userDoc.save(), user.id);

  memberDoc.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.create();
    const firstNode = document.items[0] as Heading1Item;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);

    doc.users[member.id] = selection;
  });
  memberDoc.merge(userDoc.save(), user.id);

  return {
    user,
    member,
    userDoc,
    memberDoc,
  };
}
