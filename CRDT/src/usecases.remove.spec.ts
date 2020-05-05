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

describe('.remove()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('文字削除を行ったとき', () => {
      it('選択範囲始点の前の文字が1文字削除されて、選択範囲始点と終点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        inlineText.text = 'ABCDEFGH'.split('');
        userSelection.range.anchor.offset = 8;
        userSelection.range.focus.offset = 8;

        userDoc.change((doc) => {
          usecases.remove(user.id, doc);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲始点の前の文字が1文字削除されて、共同編集者選択範囲始点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ACDEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 4;
        memberSelection.range.focus.offset = 4;

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
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲始点の前の文字が1文字削除されて、共同編集者選択範囲終点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ACDEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 0;
        memberSelection.range.focus.offset = 3;

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
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲始点の前の文字が1文字削除されて、共同編集者選択範囲の始点と終点が逆位置でも始点が1文字前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ACDEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 3;
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
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
          }
          usecases.remove(user.id, doc);
        });
        memberDoc.merge(userDoc);

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
        inlineText.text = 'ADEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
        memberSelection.range.focus.offset = 2;

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
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲の文字が削除されて、共同編集者選択範囲位置が文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ADEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
        memberSelection.range.focus.offset = 2;

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
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲の文字が削除されて、共同編集者選択範囲終点が文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ADEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 0;
        memberSelection.range.focus.offset = 2;

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
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('選択範囲の文字が削除されて、共同編集者選択範囲が始点と終点が逆位置でも文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ADEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
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
          usecases.remove(user.id, doc);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      it('逆位置の選択範囲の文字が削除されて、共同編集者選択範囲が始点と終点が逆位置でも文字数分前に移動していること', () => {
        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ADEFGHI'.split('');
        userSelection.range.anchor.offset = 1;
        userSelection.range.focus.offset = 1;
        memberSelection.range.anchor.offset = 2;
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
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
          }
          usecases.remove(user.id, doc);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });

      describe('インラインを跨ぎ削除される場合', () => {
        it('選択範囲の文字が削除されて、編集者選択範囲終点が編集者選択範囲始点に移動していること', () => {
          userDoc.change((doc) => {
            const document = doc.document;
            const selection = doc.users[user.id];
            const range = selection.range;
            const targetNode = document.nodes[0].nodes[0].nodes[0];

            selection.ids = [targetNode.id];
            if (range) {
              range.anchor.id = targetNode.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = targetNode.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          node.inline.splice(1, 1);
          // TODO: インラインを結合する
          const inline1 = node.inline[0];
          const inline2 = node.inline[1];
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
            const targetNode = document.nodes[0].nodes[0].nodes[0];

            selection.ids = [targetNode.id];
            if (range) {
              range.anchor.id = targetNode.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = targetNode.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }

            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            memberSelection.ids = [targetNode.id];
            if (memberRange) {
              memberRange.anchor.id = targetNode.inline[0].id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 3));
              memberRange.focus.id = targetNode.inline[2].id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 2));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          // TODO: インラインを結合する
          node.inline.splice(1, 1);
          const inline1 = node.inline[0];
          const inline2 = node.inline[1];
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
            const targetNode = document.nodes[0].nodes[0].nodes[0];

            selection.ids = [targetNode.id];
            if (range) {
              range.anchor.id = targetNode.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = targetNode.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }

            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            memberSelection.ids = [targetNode.id];
            if (memberRange) {
              memberRange.anchor.id = targetNode.inline[0].id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 1));
              memberRange.focus.id = targetNode.inline[2].id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 2));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline.splice(1, 1);
          const inline1 = node.inline[0];
          const inline2 = node.inline[1];
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
            const targetNode = document.nodes[0].nodes[0].nodes[0];

            selection.ids = [targetNode.id];
            if (range) {
              range.anchor.id = targetNode.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = targetNode.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }

            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            memberSelection.ids = [targetNode.id];
            if (memberRange) {
              memberRange.anchor.id = targetNode.inline[2].id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 2));
              memberRange.focus.id = targetNode.inline[0].id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 3));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          // TODO: インラインを結合する
          node.inline.splice(1, 1);
          const inline1 = node.inline[0];
          const inline2 = node.inline[1];
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
            const targetNode = document.nodes[0].nodes[0].nodes[0];

            selection.ids = [targetNode.id];
            if (range) {
              range.anchor.id = targetNode.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = targetNode.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }

            const memberSelection = doc.users[member.id];
            const memberRange = memberSelection.range;
            memberSelection.ids = [targetNode.id];
            if (memberRange) {
              memberRange.anchor.id = targetNode.inline[2].id;
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 2));
              memberRange.focus.id = targetNode.inline[0].id;
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 3));
            }
          });

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          // TODO: インラインを結合する
          node.inline.splice(1, 1);
          const inline1 = node.inline[0];
          const inline2 = node.inline[1];
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
          const selection = doc.users[user.id];
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
          selection.ids = [document.nodes[1].id, document.nodes[2].id];
          selection.range = null;
        });

        const expectedDoc = toLooseJSON(userDoc);
        const userSelection = expectedDoc.doc.users[user.id];
        expectedDoc.doc.document.nodes.splice(1, 2);
        expectedDoc.doc.document.nodes[0].next = expectedDoc.doc.document.nodes[1].id;
        expectedDoc.doc.document.nodes[1].prev = expectedDoc.doc.document.nodes[0].id;
        userSelection.ids = [expectedDoc.doc.document.nodes[1].id];
        userSelection.range = null;

        userDoc.change((doc) => {
          usecases.remove(user.id, doc);
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});
