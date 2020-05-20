import * as assert from 'power-assert';

import { usecases } from './usecases';
import { utils as sutils } from './selection';
import { CRDTDocument } from './CRDTDocument';
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

describe('確定操作', () => {
  describe('インライン選択状態', () => {
    describe('選択範囲が閉じている状態', () => {
      describe('共同編集者選択範囲が編集者と同じ位置の状態', () => {
        it('任意の文字が挿入されること(末尾1文字)', () => {
          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          inlineText.text = 'ABCDEFGHIJ'.split('');
          userSelection.range.anchor.offset = 10;
          userSelection.range.focus.offset = 10;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('任意の文字が挿入されること(末尾3文字)', () => {
          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          inlineText.text = 'ABCDEFGHIJKL'.split('');
          userSelection.range.anchor.offset = 12;
          userSelection.range.focus.offset = 12;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('任意の文字が挿入されること(先頭3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'JKLABCDEFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.offset = 0;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe('共同編集者選択範囲が閉じており、編集者選択範囲前にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲始点と同じ位置にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲始点と同じ位置にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 8;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 8;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、始点が編集者選択範囲前点と同じ位置、終点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 8;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、終点が編集者選択範囲前点と同じ位置、始点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 8;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
    });

    describe('選択範囲が開いている状態', () => {
      it('選択範囲の文字列が削除され、任意文字が入力されていること(中間3文字)', () => {
        userDoc.change((doc) => {
          const selection = doc.users[user.id];
          const range = selection.range;

          if (range) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 7));
          }
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const selection = doc.users[member.id];
          const range = selection.range;

          if (range) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
          }
        });
        userDoc.merge(memberDoc);

        const expectedDoc = toLooseJSON(userDoc);
        const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        inlineText.text = 'ABCJKLHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 3;
        memberSelection.range.focus.offset = 3;

        userDoc.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberDoc.merge(userDoc);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
      // FYI: このケースは、removeとの組み合わせであり、上記のケースのみのテストに留める
    });
  });

  describe('項目選択状態', () => {
    describe('編集者選択範囲と共同編集者選択範囲が同じ項目を選択していた場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userDoc.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[0].id;
          selection.focus = doc.document.nodes[2].id;
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[0].id;
          selection.focus = doc.document.nodes[2].id;
        });
        userDoc.merge(memberDoc);

        const expectedDoc = toLooseJSON(userDoc);

        userDoc.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberDoc.merge(userDoc);

        if (
          !(
            userDoc.doc.document.nodes[0] &&
            userDoc.doc.document.nodes[0].inline &&
            userDoc.doc.document.nodes[0].inline[0]
          )
        )
          return;

        const nodes = expectedDoc.doc.document.nodes;
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        nodes[0].inline[0].id = userDoc.doc.document.nodes[0].inline[0].id;
        nodes[0].inline[0].text = 'JKL'.split('');
        nodes[0].next = nodes[3].id;
        nodes[3].prev = nodes[0].id;
        userSelection.anchor = nodes[0].id;
        userSelection.focus = nodes[0].id;
        userSelection.range = {
          anchor: { offset: 3, id: userDoc.doc.document.nodes[0].inline[0].id },
          focus: { offset: 3, id: userDoc.doc.document.nodes[0].inline[0].id },
        };
        memberSelection.anchor = nodes[0].id;
        memberSelection.focus = nodes[0].id;
        memberSelection.range = null;
        expectedDoc.doc.document.nodes.splice(1, 2);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });

    describe('編集者選択範囲前半が共同編集者選択範囲後半と重複していた場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userDoc.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[1].id;
          selection.focus = doc.document.nodes[3].id;
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[0].id;
          selection.focus = doc.document.nodes[2].id;
        });
        userDoc.merge(memberDoc);

        const expectedDoc = toLooseJSON(userDoc);

        userDoc.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberDoc.merge(userDoc);

        if (
          !(
            userDoc.doc.document.nodes[1] &&
            userDoc.doc.document.nodes[1].inline &&
            userDoc.doc.document.nodes[1].inline[0]
          )
        )
          return;

        const nodes = expectedDoc.doc.document.nodes;
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        nodes[1].inline[0].id = userDoc.doc.document.nodes[1].inline[0].id;
        nodes[1].inline[0].text = 'JKL'.split('');
        nodes[1].next = nodes[4].id;
        nodes[4].prev = nodes[1].id;
        userSelection.anchor = nodes[1].id;
        userSelection.focus = nodes[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
          focus: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
        };
        memberSelection.anchor = nodes[0].id;
        memberSelection.focus = nodes[1].id;
        memberSelection.range = null;
        expectedDoc.doc.document.nodes.splice(2, 2);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });

    describe('編集者選択範囲が共同編集者選択範囲内にある場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userDoc.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[1].id;
          selection.focus = doc.document.nodes[3].id;
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[0].id;
          selection.focus = doc.document.nodes[4].id;
        });
        userDoc.merge(memberDoc);

        const expectedDoc = toLooseJSON(userDoc);

        userDoc.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberDoc.merge(userDoc);

        if (
          !(
            userDoc.doc.document.nodes[1] &&
            userDoc.doc.document.nodes[1].inline &&
            userDoc.doc.document.nodes[1].inline[0]
          )
        )
          return;

        const nodes = expectedDoc.doc.document.nodes;
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        nodes[1].inline[0].id = userDoc.doc.document.nodes[1].inline[0].id;
        nodes[1].inline[0].text = 'JKL'.split('');
        nodes[1].next = nodes[4].id;
        nodes[4].prev = nodes[1].id;
        userSelection.anchor = nodes[1].id;
        userSelection.focus = nodes[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
          focus: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
        };
        memberSelection.anchor = nodes[0].id;
        memberSelection.focus = nodes[4].id;
        memberSelection.range = null;
        expectedDoc.doc.document.nodes.splice(2, 2);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });

    describe('編集者選択範囲後半が共同編集者選択範囲前半と重複していた場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userDoc.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[1].id;
          selection.focus = doc.document.nodes[3].id;
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[2].id;
          selection.focus = doc.document.nodes[4].id;
        });
        userDoc.merge(memberDoc);

        const expectedDoc = toLooseJSON(userDoc);

        userDoc.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberDoc.merge(userDoc);

        if (
          !(
            userDoc.doc.document.nodes[1] &&
            userDoc.doc.document.nodes[1].inline &&
            userDoc.doc.document.nodes[1].inline[0]
          )
        )
          return;

        const nodes = expectedDoc.doc.document.nodes;
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        nodes[1].inline[0].id = userDoc.doc.document.nodes[1].inline[0].id;
        nodes[1].inline[0].text = 'JKL'.split('');
        nodes[1].next = nodes[4].id;
        nodes[4].prev = nodes[1].id;
        userSelection.anchor = nodes[1].id;
        userSelection.focus = nodes[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
          focus: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
        };
        memberSelection.anchor = nodes[1].id;
        memberSelection.focus = nodes[4].id;
        memberSelection.range = null;
        expectedDoc.doc.document.nodes.splice(2, 2);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });

    describe('編集者選択範囲内に共同編集者選択範囲がある場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userDoc.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[1].id;
          selection.focus = doc.document.nodes[3].id;
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.nodes[2].id;
          selection.focus = doc.document.nodes[2].id;
        });
        userDoc.merge(memberDoc);

        const expectedDoc = toLooseJSON(userDoc);

        userDoc.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberDoc.merge(userDoc);

        if (
          !(
            userDoc.doc.document.nodes[1] &&
            userDoc.doc.document.nodes[1].inline &&
            userDoc.doc.document.nodes[1].inline[0]
          )
        )
          return;

        const nodes = expectedDoc.doc.document.nodes;
        const userSelection = expectedDoc.doc.users[user.id];
        const memberSelection = expectedDoc.doc.users[member.id];
        nodes[1].inline[0].id = userDoc.doc.document.nodes[1].inline[0].id;
        nodes[1].inline[0].text = 'JKL'.split('');
        nodes[1].next = nodes[4].id;
        nodes[4].prev = nodes[1].id;
        userSelection.anchor = nodes[1].id;
        userSelection.focus = nodes[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
          focus: { offset: 3, id: userDoc.doc.document.nodes[1].inline[0].id },
        };
        memberSelection.anchor = nodes[1].id;
        memberSelection.focus = nodes[1].id;
        memberSelection.range = null;
        expectedDoc.doc.document.nodes.splice(2, 2);

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});
