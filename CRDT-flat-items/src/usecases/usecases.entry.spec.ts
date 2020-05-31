import * as assert from 'power-assert';

import { factory } from '../factory';
import { usecases } from '../usecases';
import { BoardHandler } from '../BoardHandler';
import { createSampleData, toLooseJSON } from '../testutils';
import { ParagraphItem, utils as sutils } from '../structures';

let user: { id: string };
let member: { id: string };
let userBoardHandler: BoardHandler;

beforeEach(() => {
  const result = createSampleData();
  user = result.user;
  member = result.member;
  userBoardHandler = result.userBoardHandler;
});

describe('確定操作', () => {
  describe('インライン選択状態', () => {
    describe('選択範囲が閉じている状態', () => {
      describe('共同編集者選択範囲が編集者と同じ位置の状態', () => {
        it('インラインが分割され、編集者選択範囲が新規項目先頭に移動し、共同編集者選択範囲は移動しない', () => {
          userBoardHandler.change((board) => {
            const range = board.users[user.id].range;
            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
            const memberRange = board.users[member.id].range;
            if (memberRange) {
              memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 5));
              memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 5));
            }
          });

          const expectedDoc = toLooseJSON(userBoardHandler);
          const users = expectedDoc.data.users;
          const items = expectedDoc.data.document.items;
          items[0].inline[0].text = 'ABCDE'.split('');
          items.splice(1, 0, factory.item.createParagraph());
          items[1].inline.push(factory.inline.createInlineText());
          items[1].inline[0].text = 'FGHI'.split('');

          userBoardHandler.change((board) => {
            usecases(user.id, board).enter();
          });

          const item = userBoardHandler.data.document.items[1] as ParagraphItem;
          items[1].id = item.id;
          items[1].inline[0].id = item.inline[0].id;
          items[1].inline[0].parent = item.id;
          users[user.id].anchor = item.id;
          users[user.id].focus = item.id;
          users[user.id].range = {
            anchor: {
              id: item.inline[0].id,
              offset: 0,
            },
            focus: {
              id: item.inline[0].id,
              offset: 0,
            },
          };

          assert.deepEqual(toLooseJSON(userBoardHandler), toLooseJSON(expectedDoc));
        });

        it('インラインが分割され、編集者選択範囲が新規項目先頭に移動し、共同編集者選択範囲は移動しない(末尾)', () => {
          const expectedDoc = toLooseJSON(userBoardHandler);
          const users = expectedDoc.data.users;
          const items = expectedDoc.data.document.items;
          items.splice(1, 0, factory.item.createParagraph());
          items[1].inline.push(factory.inline.createInlineText());
          items[1].inline[0].text = ''.split('');

          userBoardHandler.change((board) => {
            usecases(user.id, board).enter();
          });

          const item = userBoardHandler.data.document.items[1] as ParagraphItem;
          items[1].id = item.id;
          items[1].inline[0].id = item.inline[0].id;
          items[1].inline[0].parent = item.id;
          users[user.id].anchor = item.id;
          users[user.id].focus = item.id;
          users[user.id].range = {
            anchor: {
              id: item.inline[0].id,
              offset: 0,
            },
            focus: {
              id: item.inline[0].id,
              offset: 0,
            },
          };

          assert.deepEqual(toLooseJSON(userBoardHandler), toLooseJSON(expectedDoc));
        });

        it('インラインが分割され、編集者選択範囲が新規項目先頭に移動し、共同編集者選択範囲は移動しない(2インデント)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[3];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          userBoardHandler.change((board) => {
            const item = board.document.items[3];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });

          const expectedDoc = toLooseJSON(userBoardHandler);
          const users = expectedDoc.data.users;
          const items = expectedDoc.data.document.items;
          items[3].inline[0].text = 'ABCDE'.split('');
          items.splice(4, 0, factory.item.createParagraph());
          items[4].inline.push(factory.inline.createInlineText());
          items[4].inline[0].text = 'FGHI'.split('');
          items[4].indent = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).enter();
          });

          const item = userBoardHandler.data.document.items[4] as ParagraphItem;
          items[4].id = item.id;
          items[4].inline[0].id = item.inline[0].id;
          items[4].inline[0].parent = item.id;
          users[user.id].anchor = item.id;
          users[user.id].focus = item.id;
          users[user.id].range = {
            anchor: {
              id: item.inline[0].id,
              offset: 0,
            },
            focus: {
              id: item.inline[0].id,
              offset: 0,
            },
          };

          assert.deepEqual(toLooseJSON(userBoardHandler), toLooseJSON(expectedDoc));
        });
      });
    });

    describe('選択範囲が開いている状態', () => {
      it('編集者選択範囲が削除されて、文字列分割が行われること', () => {
        userBoardHandler.change((board) => {
          const range = board.users[user.id].range;
          if (range) {
            range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
            range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
          }
          const memberRange = board.users[member.id].range;
          if (memberRange) {
            memberRange.anchor.offset.increment(sutils.getOffset(memberRange.anchor.offset.value, 5));
            memberRange.focus.offset.increment(sutils.getOffset(memberRange.focus.offset.value, 5));
          }
        });

        const expectedDoc = toLooseJSON(userBoardHandler);
        const users = expectedDoc.data.users;
        const items = expectedDoc.data.document.items;
        items[0].inline[0].text = 'ABC'.split('');
        items.splice(1, 0, factory.item.createParagraph());
        items[1].inline.push(factory.inline.createInlineText());
        items[1].inline[0].text = 'FGHI'.split('');

        userBoardHandler.change((board) => {
          usecases(user.id, board).enter();
        });

        const item = userBoardHandler.data.document.items[1] as ParagraphItem;
        items[1].id = item.id;
        items[1].inline[0].id = item.inline[0].id;
        items[1].inline[0].parent = item.id;
        users[user.id].anchor = item.id;
        users[user.id].focus = item.id;
        users[user.id].range = {
          anchor: {
            id: item.inline[0].id,
            offset: 0,
          },
          focus: {
            id: item.inline[0].id,
            offset: 0,
          },
        };
        users[member.id].range.anchor.offset = 3;
        users[member.id].range.focus.offset = 3;

        assert.deepEqual(toLooseJSON(userBoardHandler), toLooseJSON(expectedDoc));
      });
      // FYI: 組み合わせの関数のため、ここではこのテストケースに止める
    });
  });

  describe('項目選択状態', () => {
    describe('編集者選択範囲と共同編集者選択範囲が同じ項目を選択していた場合', () => {});

    describe('編集者選択範囲前半が共同編集者選択範囲後半と重複していた場合', () => {});

    describe('編集者選択範囲が共同編集者選択範囲内にある場合', () => {});

    describe('編集者選択範囲後半が共同編集者選択範囲前半と重複していた場合', () => {});

    describe('編集者選択範囲内に共同編集者選択範囲がある場合', () => {});
  });
});
