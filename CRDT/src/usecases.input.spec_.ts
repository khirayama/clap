import * as assert from 'power-assert';

import { usecases } from './usecases';
import { CRDTDocument } from './CRDTDocument';
import { utils as sutils } from './selection';
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

describe('.input()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('「あいうえお」と挿入したとき', () => {
      it('文字列が挿入されて選択範囲位置が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        inlineText.text = 'ABCDEFGHIあいうえお'.split('');
        userSelection.range.anchor.offset = 14;
        userSelection.range.focus.offset = 14;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, 'あいうえお'.split(''));
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲始点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'AあいうえおBCDEFGHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 7;
        memberSelection.range.focus.offset = 7;

        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
          }
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲終点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'AあいうえおBCDEFGHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 1;
        memberSelection.range.focus.offset = 7;

        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
          }
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲の始点と終点が逆位置の場合でも始点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'AあいうえおBCDEFGHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 7;
        memberSelection.range.focus.offset = 0;

        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
          }
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲の始点と終点が逆位置の場合でも始点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'AあいうえおBCDEFGHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 8;
        memberSelection.range.focus.offset = 7;

        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
          }
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });

  describe('選択範囲が開いている状態で', () => {
    describe('「あいうえお」と挿入したとき', () => {
      it('選択範囲を削除が適用され、文字挿入が行われていること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'AあいうえおDEFGHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 0;
        memberSelection.range.focus.offset = 7;

        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
          }
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('共同編集者選択範囲が逆位置でも選択範囲を削除が適用され、文字挿入が行われていること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'AあいうえおDEFGHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 7;
        memberSelection.range.focus.offset = 0;

        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
          }
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});
