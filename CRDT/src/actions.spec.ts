import * as assert from 'power-assert';

import { actions } from './actions';
import { CRDTDocument } from './CRDTDocument';
import { utils as selectionUtils } from './selection';
import { createSampleData, toLooseJSON } from './testutils';

let user: { id: string };
let member: { id: string };
let userDoc: CRDTDocument;
let memberDoc: CRDTDocument;

beforeEach(() => {
  const result = createSampleData();
  user = result.user;
  member = result.member;
  userDoc = result.userDoc;
  memberDoc = result.memberDoc;
});

describe('.insertText()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('「あいうえお」と挿入したとき', () => {
      it('文字列が挿入されて選択範囲位置が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        inlineText.text = ['あ', 'い', 'う', 'え', 'お'];
        userSelection.range.anchor.offset = 5;
        userSelection.range.focus.offset = 5;

        userDoc.change((doc) => {
          actions.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲始点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['1', 'あ', 'い', 'う', 'え', 'お', '2', '3'];
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 7;
        memberSelection.range.focus.offset = 7;

        userDoc.change((doc) => {
          actions.insertText(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 1));
          }
          actions.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲終点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['1', 'あ', 'い', 'う', 'え', 'お', '2', '3'];
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 1;
        memberSelection.range.focus.offset = 7;

        userDoc.change((doc) => {
          actions.insertText(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 1));
          }
          actions.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});

describe('.deleteText()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('文字削除を行ったとき', () => {
      it('選択範囲始点の前の文字が1文字削除されて、選択範囲始点と終点が1文字前に移動していること', () => {
        userDoc.change((doc) => {
          actions.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });

        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        inlineText.text = ['あ', 'い', 'う', 'え'];
        userSelection.range.anchor.offset = 4;
        userSelection.range.focus.offset = 4;

        userDoc.change((doc) => {
          actions.deleteText(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲始点の前の文字が1文字削除されて、共同編集者選択範囲始点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'う', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 4;
        memberSelection.range.focus.offset = 4;

        userDoc.change((doc) => {
          actions.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 5));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 5));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 2));
          }
          actions.deleteText(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲始点の前の文字が1文字削除されて、共同編集者選択範囲終点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'う', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 0;
        memberSelection.range.focus.offset = 3;

        userDoc.change((doc) => {
          actions.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 0));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 4));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 2));
          }
          actions.deleteText(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});
