import * as assert from 'power-assert';

import { usecases } from '../usecases';
import { utils as sutils } from '../structures';
import { BoardHandler } from '../BoardHandler';
import { createSampleData, toLooseJSON } from '../testutils';

let user: { id: string };
let member: { id: string };
let userBoardHandler: BoardHandler;
let memberBoardHandler: BoardHandler;

beforeEach(() => {
  const result = createSampleData();
  user = result.user;
  member = result.member;
  userBoardHandler = result.userBoardHandler;
  memberBoardHandler = result.memberBoardHandler;
});

describe('入力操作', () => {
  describe('インライン選択状態', () => {
    describe('選択範囲が閉じている状態', () => {
      describe('共同編集者選択範囲が編集者と同じ位置の状態', () => {
        it('任意の文字が挿入されること(末尾1文字)', () => {
          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          inlineText.text = 'ABCDEFGHIJ'.split('');
          userSelection.range.anchor.offset = 10;
          userSelection.range.focus.offset = 10;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('任意の文字が挿入されること(末尾3文字)', () => {
          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          inlineText.text = 'ABCDEFGHIJKL'.split('');
          userSelection.range.anchor.offset = 12;
          userSelection.range.focus.offset = 12;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('任意の文字が挿入されること(先頭3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'JKLABCDEFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.offset = 0;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe('共同編集者選択範囲が閉じており、編集者選択範囲前にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲始点と同じ位置にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲始点と同じ位置にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 8;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 8;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、始点が編集者選択範囲前点と同じ位置、終点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 8;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
      describe('共同編集者選択範囲が開いており、終点が編集者選択範囲前点と同じ位置、始点が編集者選択範囲始点後にある状態', () => {
        it('任意の文字が挿入されること(中間3文字)', () => {
          userBoardHandler.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCJKLDEFGHI'.split('');
          userSelection.range.anchor.offset = 6;
          userSelection.range.focus.offset = 6;
          memberSelection.range.anchor.offset = 8;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).input(['J', 'K', 'L']);
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });

    describe('選択範囲が開いている状態', () => {
      it('選択範囲の文字列が削除され、任意文字が入力されていること(中間3文字)', () => {
        userBoardHandler.change((doc) => {
          const selection = doc.users[user.id];
          const range = selection.range;

          if (range) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 7));
          }
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);
        memberBoardHandler.change((doc) => {
          const selection = doc.users[member.id];
          const range = selection.range;

          if (range) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
          }
        });
        userBoardHandler.merge(memberBoardHandler.save(), member.id);

        const expectedDoc = toLooseJSON(userBoardHandler);
        const inlineText = expectedDoc.data.document.items[0].inline[0];
        const userSelection = expectedDoc.data.users[user.id];
        const memberSelection = expectedDoc.data.users[member.id];
        inlineText.text = 'ABCJKLHI'.split('');
        userSelection.range.anchor.offset = 6;
        userSelection.range.focus.offset = 6;
        memberSelection.range.anchor.offset = 3;
        memberSelection.range.focus.offset = 3;

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
      // FYI: このケースは、removeとの組み合わせであり、上記のケースのみのテストに留める
    });
  });

  describe('項目選択状態', () => {
    describe('編集者選択範囲と共同編集者選択範囲が同じ項目を選択していた場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userBoardHandler.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.items[0].id;
          selection.focus = doc.document.items[2].id;
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);
        memberBoardHandler.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.items[0].id;
          selection.focus = doc.document.items[2].id;
        });
        userBoardHandler.merge(memberBoardHandler.save(), member.id);

        const expectedDoc = toLooseJSON(userBoardHandler);

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);

        if (
          !(
            userBoardHandler.data.document.items[0] &&
            userBoardHandler.data.document.items[0].inline &&
            userBoardHandler.data.document.items[0].inline[0]
          )
        )
          return;

        const items = expectedDoc.data.document.items;
        const userSelection = expectedDoc.data.users[user.id];
        const memberSelection = expectedDoc.data.users[member.id];
        items[0].inline[0].id = userBoardHandler.data.document.items[0].inline[0].id;
        items[0].inline[0].text = 'JKL'.split('');
        userSelection.anchor = items[0].id;
        userSelection.focus = items[0].id;
        userSelection.range = {
          anchor: { offset: 3, id: userBoardHandler.data.document.items[0].inline[0].id },
          focus: { offset: 3, id: userBoardHandler.data.document.items[0].inline[0].id },
        };
        memberSelection.anchor = items[0].id;
        memberSelection.focus = items[0].id;
        memberSelection.range = null;
        expectedDoc.data.document.items.splice(1, 2);

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });

    describe('編集者選択範囲前半が共同編集者選択範囲後半と重複していた場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userBoardHandler.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.items[1].id;
          selection.focus = doc.document.items[3].id;
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);
        memberBoardHandler.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.items[0].id;
          selection.focus = doc.document.items[2].id;
        });
        userBoardHandler.merge(memberBoardHandler.save(), member.id);

        const expectedDoc = toLooseJSON(userBoardHandler);

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);

        if (
          !(
            userBoardHandler.data.document.items[1] &&
            userBoardHandler.data.document.items[1].inline &&
            userBoardHandler.data.document.items[1].inline[0]
          )
        )
          return;

        const items = expectedDoc.data.document.items;
        const userSelection = expectedDoc.data.users[user.id];
        const memberSelection = expectedDoc.data.users[member.id];
        items[1].inline[0].id = userBoardHandler.data.document.items[1].inline[0].id;
        items[1].inline[0].text = 'JKL'.split('');
        items[1].inline.splice(1, 2);
        userSelection.anchor = items[1].id;
        userSelection.focus = items[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
          focus: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
        };
        memberSelection.anchor = items[0].id;
        memberSelection.focus = items[1].id;
        memberSelection.range = null;
        expectedDoc.data.document.items.splice(2, 2);

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });

    describe('編集者選択範囲が共同編集者選択範囲内にある場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userBoardHandler.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.items[1].id;
          selection.focus = doc.document.items[3].id;
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);
        memberBoardHandler.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.items[0].id;
          selection.focus = doc.document.items[4].id;
        });
        userBoardHandler.merge(memberBoardHandler.save(), member.id);

        const expectedDoc = toLooseJSON(userBoardHandler);

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);

        if (
          !(
            userBoardHandler.data.document.items[1] &&
            userBoardHandler.data.document.items[1].inline &&
            userBoardHandler.data.document.items[1].inline[0]
          )
        )
          return;

        const items = expectedDoc.data.document.items;
        const userSelection = expectedDoc.data.users[user.id];
        const memberSelection = expectedDoc.data.users[member.id];
        items[1].inline[0].id = userBoardHandler.data.document.items[1].inline[0].id;
        items[1].inline[0].text = 'JKL'.split('');
        items[1].inline.splice(1, 2);
        userSelection.anchor = items[1].id;
        userSelection.focus = items[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
          focus: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
        };
        memberSelection.anchor = items[0].id;
        memberSelection.focus = items[4].id;
        memberSelection.range = null;
        expectedDoc.data.document.items.splice(2, 2);

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });

    describe('編集者選択範囲後半が共同編集者選択範囲前半と重複していた場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userBoardHandler.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.items[1].id;
          selection.focus = doc.document.items[3].id;
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);
        memberBoardHandler.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.items[2].id;
          selection.focus = doc.document.items[4].id;
        });
        userBoardHandler.merge(memberBoardHandler.save(), member.id);

        const expectedDoc = toLooseJSON(userBoardHandler);

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);

        if (
          !(
            userBoardHandler.data.document.items[1] &&
            userBoardHandler.data.document.items[1].inline &&
            userBoardHandler.data.document.items[1].inline[0]
          )
        )
          return;

        const items = expectedDoc.data.document.items;
        const userSelection = expectedDoc.data.users[user.id];
        const memberSelection = expectedDoc.data.users[member.id];
        items[1].inline[0].id = userBoardHandler.data.document.items[1].inline[0].id;
        items[1].inline[0].text = 'JKL'.split('');
        items[1].inline.splice(1, 2);
        userSelection.anchor = items[1].id;
        userSelection.focus = items[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
          focus: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
        };
        memberSelection.anchor = items[1].id;
        memberSelection.focus = items[4].id;
        memberSelection.range = null;
        expectedDoc.data.document.items.splice(2, 2);

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });

    describe('編集者選択範囲内に共同編集者選択範囲がある場合', () => {
      it('選択項目が先頭以外削除され、先頭は段落項目へ変換され、段落項目インラインが空の状態から任意文字列が入力されていること', () => {
        userBoardHandler.change((doc) => {
          const selection = doc.users[user.id];
          selection.range = null;
          selection.anchor = doc.document.items[1].id;
          selection.focus = doc.document.items[3].id;
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);
        memberBoardHandler.change((doc) => {
          const selection = doc.users[member.id];
          selection.range = null;
          selection.anchor = doc.document.items[2].id;
          selection.focus = doc.document.items[2].id;
        });
        userBoardHandler.merge(memberBoardHandler.save(), member.id);

        const expectedDoc = toLooseJSON(userBoardHandler);

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).input(['J', 'K', 'L']);
        });
        memberBoardHandler.merge(userBoardHandler.save(), user.id);

        if (
          !(
            userBoardHandler.data.document.items[1] &&
            userBoardHandler.data.document.items[1].inline &&
            userBoardHandler.data.document.items[1].inline[0]
          )
        )
          return;

        const items = expectedDoc.data.document.items;
        const userSelection = expectedDoc.data.users[user.id];
        const memberSelection = expectedDoc.data.users[member.id];
        items[1].inline[0].id = userBoardHandler.data.document.items[1].inline[0].id;
        items[1].inline[0].text = 'JKL'.split('');
        items[1].inline.splice(1, 2);
        userSelection.anchor = items[1].id;
        userSelection.focus = items[1].id;
        userSelection.range = {
          anchor: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
          focus: { offset: 3, id: userBoardHandler.data.document.items[1].inline[0].id },
        };
        memberSelection.anchor = items[1].id;
        memberSelection.focus = items[1].id;
        memberSelection.range = null;
        expectedDoc.data.document.items.splice(2, 2);

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });
  });
});
