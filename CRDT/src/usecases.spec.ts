import * as assert from 'power-assert';

import { usecases } from './usecases';
import { transform } from './transform';
import { factory } from './factory';
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
        inlineText.text = ['あ', 'い', 'う', 'え', 'お'];
        userSelection.range.anchor.offset = 5;
        userSelection.range.focus.offset = 5;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
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
          usecases.input(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
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
          usecases.input(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
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

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('文字列が挿入されて共同編集者の選択範囲の始点と終点が逆位置の場合でも始点が文字数分後ろへ移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['1', 'あ', 'い', 'う', 'え', 'お', '2', '3'];
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 7;
        memberSelection.range.focus.offset = 0;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
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
        inlineText.text = ['1', 'あ', 'い', 'う', 'え', 'お', '4'];
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 0;
        memberSelection.range.focus.offset = 7;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['1', '2', '3', '4']);
        });
        memberDoc.merge(userDoc);
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

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('共同編集者選択範囲が逆位置でも選択範囲を削除が適用され、文字挿入が行われていること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['1', 'あ', 'い', 'う', 'え', 'お', '4'];
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 7;
        memberSelection.range.focus.offset = 0;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['1', '2', '3', '4']);
        });
        memberDoc.merge(userDoc);
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

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});

describe('.remove()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('文字削除を行ったとき', () => {
      it('選択範囲始点の前の文字が1文字削除されて、選択範囲始点と終点が1文字前に移動していること', () => {
        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });

        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        inlineText.text = ['あ', 'い', 'う', 'え'];
        userSelection.range.anchor.offset = 4;
        userSelection.range.focus.offset = 4;

        userDoc.change((doc) => {
          usecases.remove(user.id, doc);
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
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
          usecases.remove(user.id, doc);
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
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
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
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲始点の前の文字が1文字削除されて、共同編集者選択範囲の始点と終点が逆位置でも始点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'う', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 3;
        memberSelection.range.focus.offset = 0;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
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
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });

  describe('選択範囲が開いている状態で', () => {
    describe('文字削除を行ったとき', () => {
      it('選択範囲の文字が削除されて、選択範囲始点と終点が文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
        memberSelection.range.focus.offset = 2;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
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
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲の文字が削除されて、共同編集者選択範囲位置が文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
        memberSelection.range.focus.offset = 2;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
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
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲の文字が削除されて、共同編集者選択範囲終点が文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 0;
        memberSelection.range.focus.offset = 2;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
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
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲の文字が削除されて、共同編集者選択範囲が始点と終点が逆位置でも文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
        memberSelection.range.focus.offset = 0;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
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
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('逆位置の選択範囲の文字が削除されて、共同編集者選択範囲が始点と終点が逆位置でも文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = ['あ', 'え', 'お'];
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
        memberSelection.range.focus.offset = 0;

        userDoc.change((doc) => {
          usecases.input(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        memberDoc.merge(userDoc);
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
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
          }
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      describe('インラインを跨ぎ削除される場合', () => {
        it('選択範囲の文字が削除されて、編集者選択範囲終点が編集者選択範囲始点に移動していること', () => {
          userDoc.change((doc) => {
            const document = doc.document;
            const selection = doc.users[user.id];
            const range = selection.range;
            const firstNode = document.nodes[0];

            const inline1 = firstNode.inline[0];
            inline1.text.push('A', 'B', 'C');
            const inline2 = factory.inline.createInlineText();
            inline2.parent = firstNode.id;
            inline2.text.push('D', 'E', 'F');
            const inline3 = factory.inline.createInlineText();
            inline3.parent = firstNode.id;
            inline3.text.push('G', 'H', 'I');

            firstNode.inline.push(inline2);
            firstNode.inline.push(inline3);

            if (range) {
              range.anchor.id = inline1.id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = inline3.id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          node.inline.splice(1, 1);
          const inline1 = expectedDoc.doc.document.nodes[0].inline[0];
          const inline2 = expectedDoc.doc.document.nodes[0].inline[1];
          inline1.text = ['A', 'B'];
          inline2.text = ['H', 'I'];
          userSelection.range.anchor.id = inline1.id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = inline1.id;
          userSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('選択範囲の文字が削除されて、共同編集者選択範囲始点が編集者選択範囲を含まれている場合に共同編集者選択範囲始点が編集者選択範囲始点に移動していること', () => {
          userDoc.change((doc) => {
            const document = doc.document;
            const selection = doc.users[user.id];
            const range = selection.range;
            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            const firstNode = document.nodes[0];

            const inline1 = firstNode.inline[0];
            inline1.text.push('A', 'B', 'C');
            const inline2 = factory.inline.createInlineText();
            inline2.parent = firstNode.id;
            inline2.text.push('D', 'E', 'F');
            const inline3 = factory.inline.createInlineText();
            inline3.parent = firstNode.id;
            inline3.text.push('G', 'H', 'I');

            firstNode.inline.push(inline2);
            firstNode.inline.push(inline3);

            if (range) {
              range.anchor.id = inline1.id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = inline3.id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
            if (memberRange) {
              memberRange.anchor.id = inline1.id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 3));
              memberRange.focus.id = inline3.id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 2));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline.splice(1, 1);
          const inline1 = expectedDoc.doc.document.nodes[0].inline[0];
          const inline2 = expectedDoc.doc.document.nodes[0].inline[1];
          inline1.text = ['A', 'B'];
          inline2.text = ['H', 'I'];
          userSelection.range.anchor.id = inline1.id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = inline1.id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = inline1.id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = inline2.id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('選択範囲の文字が削除されて、共同編集者選択範囲始点が編集者選択範囲を含まれていない場合に共同編集者選択範囲始点が編集者選択範囲始点に移動していること', () => {
          userDoc.change((doc) => {
            const document = doc.document;
            const selection = doc.users[user.id];
            const range = selection.range;
            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            const firstNode = document.nodes[0];

            const inline1 = firstNode.inline[0];
            inline1.text.push('A', 'B', 'C');
            const inline2 = factory.inline.createInlineText();
            inline2.parent = firstNode.id;
            inline2.text.push('D', 'E', 'F');
            const inline3 = factory.inline.createInlineText();
            inline3.parent = firstNode.id;
            inline3.text.push('G', 'H', 'I');

            firstNode.inline.push(inline2);
            firstNode.inline.push(inline3);

            if (range) {
              range.anchor.id = inline1.id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = inline3.id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
            if (memberRange) {
              memberRange.anchor.id = inline1.id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 1));
              memberRange.focus.id = inline3.id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 2));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline.splice(1, 1);
          const inline1 = expectedDoc.doc.document.nodes[0].inline[0];
          const inline2 = expectedDoc.doc.document.nodes[0].inline[1];
          inline1.text = ['A', 'B'];
          inline2.text = ['H', 'I'];
          userSelection.range.anchor.id = inline1.id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = inline1.id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = inline1.id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = inline2.id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('選択範囲の文字が削除されて、共同編集者選択範囲終点が編集者選択範囲を含まれている場合に共同編集者選択範囲始点が編集者選択範囲始点に移動していること', () => {
          userDoc.change((doc) => {
            const document = doc.document;
            const selection = doc.users[user.id];
            const range = selection.range;
            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            const firstNode = document.nodes[0];

            const inline1 = firstNode.inline[0];
            inline1.text.push('A', 'B', 'C');
            const inline2 = factory.inline.createInlineText();
            inline2.parent = firstNode.id;
            inline2.text.push('D', 'E', 'F');
            const inline3 = factory.inline.createInlineText();
            inline3.parent = firstNode.id;
            inline3.text.push('G', 'H', 'I');

            firstNode.inline.push(inline2);
            firstNode.inline.push(inline3);

            if (range) {
              range.anchor.id = inline1.id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = inline3.id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
            if (memberRange) {
              memberRange.anchor.id = inline3.id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 2));
              memberRange.focus.id = inline1.id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 3));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline.splice(1, 1);
          const inline1 = expectedDoc.doc.document.nodes[0].inline[0];
          const inline2 = expectedDoc.doc.document.nodes[0].inline[1];
          inline1.text = ['A', 'B'];
          inline2.text = ['H', 'I'];
          userSelection.range.anchor.id = inline1.id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = inline1.id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = inline2.id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = inline1.id;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('選択範囲の文字が削除されて、共同編集者選択範囲が逆位置でも共同編集者選択範囲が正しく移動すること', () => {
          userDoc.change((doc) => {
            const document = doc.document;
            const selection = doc.users[user.id];
            const range = selection.range;
            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            const firstNode = document.nodes[0];

            const inline1 = firstNode.inline[0];
            inline1.text.push('A', 'B', 'C');
            const inline2 = factory.inline.createInlineText();
            inline2.parent = firstNode.id;
            inline2.text.push('D', 'E', 'F');
            const inline3 = factory.inline.createInlineText();
            inline3.parent = firstNode.id;
            inline3.text.push('G', 'H', 'I');

            firstNode.inline.push(inline2);
            firstNode.inline.push(inline3);

            if (range) {
              range.anchor.id = inline1.id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = inline3.id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
            if (memberRange) {
              memberRange.anchor.id = inline3.id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 2));
              memberRange.focus.id = inline1.id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 3));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline.splice(1, 1);
          const inline1 = expectedDoc.doc.document.nodes[0].inline[0];
          const inline2 = expectedDoc.doc.document.nodes[0].inline[1];
          inline1.text = ['A', 'B'];
          inline2.text = ['H', 'I'];
          userSelection.range.anchor.id = inline1.id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = inline1.id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = inline2.id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = inline1.id;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
    });
  });

  describe('項目を一つ選択している状態で', () => {
    describe('削除操作を行った時', () => {
      it('単数の対象項目が削除されていること', () => {
        userDoc.change((doc) => {
          const document = doc.document;
          const selection = doc.users[user.id];
          const paragraph1 = factory.node.createParagraphNode();
          const paragraph2 = factory.node.createParagraphNode();
          const paragraph2_1 = factory.node.createParagraphNode();
          transform.node.append(paragraph2, paragraph2_1);
          transform.node.append(document, paragraph1);
          transform.node.append(document, paragraph2);
          selection.range = null;
        });

        const expectedDoc = toLooseJSON(userDoc);
        const userSelection = expectedDoc.doc.users[user.id];
        expectedDoc.doc.document.nodes.splice(0, 1);
        expectedDoc.doc.document.nodes[0].prev = null;
        userSelection.ids = [expectedDoc.doc.document.nodes[0].id];
        userSelection.range = null;

        userDoc.change((doc) => {
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('複数の対象項目が削除されていること', () => {
        userDoc.change((doc) => {
          const document = doc.document;
          const selection = doc.users[user.id];
          const paragraph1 = factory.node.createParagraphNode();
          const paragraph2 = factory.node.createParagraphNode();
          const paragraph2_1 = factory.node.createParagraphNode();
          transform.node.append(paragraph2, paragraph2_1);
          transform.node.append(document, paragraph1);
          transform.node.append(document, paragraph2);
          selection.ids = [paragraph1.id, paragraph2.id];
          selection.range = null;
        });

        const expectedDoc = toLooseJSON(userDoc);
        const userSelection = expectedDoc.doc.users[user.id];
        expectedDoc.doc.document.nodes.splice(1, 2);
        expectedDoc.doc.document.nodes[0].next = null;
        userSelection.ids = [expectedDoc.doc.document.nodes[0].id];
        userSelection.range = null;

        userDoc.change((doc) => {
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});
