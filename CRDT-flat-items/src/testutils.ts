import * as Automerge from 'automerge';

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

  const userBoardHandler = new BoardHandler(user.id);
  const memberBoardHandler = new BoardHandler(member.id, userBoardHandler.save());

  userBoardHandler.change((doc) => {
    const document = doc.document;

    const transform = transformation(document);

    transform.item.remove(document.items[0]);

    let paragraph1 = factory.item.createParagraph();
    paragraph1 = transform.item.append(paragraph1) as ParagraphItem;
    transform.item.appendInline(paragraph1, createInlineText1());
    let paragraph2 = factory.item.createParagraph();
    paragraph2 = transform.item.append(paragraph2) as ParagraphItem;
    transform.item.appendInline(paragraph2, createInlineText1());
    let paragraph3 = factory.item.createParagraph();
    paragraph3 = transform.item.append(paragraph3) as ParagraphItem;
    transform.item.appendInline(paragraph3, createInlineText2());
    transform.item.appendInline(paragraph3, createInlineText3());
    transform.item.appendInline(paragraph3, createInlineText4());
    let paragraph4 = factory.item.createParagraph();
    paragraph4 = transform.item.append(paragraph4) as ParagraphItem;
    transform.item.appendInline(paragraph4, createInlineText1());
    let paragraph5 = factory.item.createParagraph();
    paragraph5 = transform.item.append(paragraph5) as ParagraphItem;
    transform.item.appendInline(paragraph5, createInlineText1());
    let paragraph6 = factory.item.createParagraph();
    paragraph6 = transform.item.append(paragraph6) as ParagraphItem;
    transform.item.appendInline(paragraph6, createInlineText1());
    let paragraph7 = factory.item.createParagraph();
    paragraph7 = transform.item.append(paragraph7) as ParagraphItem;
    transform.item.appendInline(paragraph7, createInlineText1());
    let paragraph8 = factory.item.createParagraph();
    paragraph8 = transform.item.append(paragraph8) as ParagraphItem;
    transform.item.appendInline(paragraph8, createInlineText2());
    transform.item.appendInline(paragraph8, createInlineText3());
    transform.item.appendInline(paragraph8, createInlineText4());
    let paragraph9 = factory.item.createParagraph();
    paragraph9 = transform.item.append(paragraph9) as ParagraphItem;
    transform.item.appendInline(paragraph9, createInlineText1());
    let paragraph10 = factory.item.createParagraph();
    paragraph10 = transform.item.append(paragraph10) as ParagraphItem;
    transform.item.appendInline(paragraph10, createInlineText1());
    let paragraph11 = factory.item.createParagraph();
    paragraph11 = transform.item.append(paragraph11) as ParagraphItem;
    transform.item.appendInline(paragraph11, createInlineText1());
    let paragraph12 = factory.item.createParagraph();
    paragraph12 = transform.item.append(paragraph12) as ParagraphItem;
    transform.item.appendInline(paragraph12, createInlineText2());
    transform.item.appendInline(paragraph12, createInlineText3());
    transform.item.appendInline(paragraph12, createInlineText4());
    let paragraph13 = factory.item.createParagraph();
    paragraph13 = transform.item.append(paragraph13) as ParagraphItem;
    transform.item.appendInline(paragraph13, createInlineText1());
  });
  memberBoardHandler.merge(userBoardHandler.save(), user.id);

  userBoardHandler.change((doc) => {
    const document = doc.document;
    const selection = doc.users[user.id];
    const firstNode = document.items[0] as ParagraphItem;

    // document.items[0].indent.increment();
    document.items[1].indent.increment(1);
    document.items[2].indent.increment(2);
    document.items[3].indent.increment(2);
    // document.items[4].indent.increment();
    // document.items[5].indent.increment();
    document.items[6].indent.increment(1);
    document.items[7].indent.increment(2);
    // document.items[8].indent.increment();
    // document.items[9].indent.increment();
    document.items[10].indent.increment(1);
    document.items[11].indent.increment(2);
    document.items[12].indent.increment(1);

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberBoardHandler.merge(userBoardHandler.save(), user.id);

  memberBoardHandler.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.create();
    const firstNode = document.items[0] as ParagraphItem;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);

    doc.users[member.id] = selection;
  });
  userBoardHandler.merge(memberBoardHandler.save(), member.id);

  return {
    user,
    member,
    userBoardHandler,
    memberBoardHandler,
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

  const userBoardHandler = new BoardHandler(user.id);
  const memberBoardHandler = new BoardHandler(member.id, userBoardHandler.save());

  userBoardHandler.change((doc) => {
    const document = doc.document;

    const transform = transformation(document);

    transform.item.remove(document.items[0]);

    let heading1 = factory.item.createHeading1();
    transform.item.appendInline(heading1, createInlineText1());
    let paragraph1 = factory.item.createParagraph();
    transform.item.appendInline(paragraph1, createInlineText1());
    let heading2 = factory.item.createHeading1();
    transform.item.appendInline(heading2, createInlineText1());

    transform.item.append(heading1);
    transform.item.append(paragraph1);
    transform.item.append(heading2);
  });
  memberBoardHandler.merge(userBoardHandler.save(), user.id);

  userBoardHandler.change((doc) => {
    const document = doc.document;
    const selection = doc.users[user.id];
    const firstNode = document.items[0] as Heading1Item;

    document.items[2].indent.increment(1);

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);
  });
  memberBoardHandler.merge(userBoardHandler.save(), user.id);

  memberBoardHandler.change((doc) => {
    const document = doc.document;
    const selection = factory.selection.create();
    const firstNode = document.items[0] as Heading1Item;

    selection.anchor = firstNode.id;
    selection.focus = firstNode.id;
    selection.range = factory.range.create(firstNode.inline[0].id, firstNode.inline[0].text.length);

    doc.users[member.id] = selection;
  });
  userBoardHandler.merge(memberBoardHandler.save(), member.id);

  return {
    user,
    member,
    userBoardHandler,
    memberBoardHandler,
  };
}
