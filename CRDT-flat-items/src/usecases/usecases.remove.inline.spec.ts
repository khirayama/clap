import * as assert from 'power-assert';

import { usecases } from '../usecases';
import { utils as sutils } from '../structures';
import { BoardHandler } from '../BoardHandler';
import { createSampleData, createSampleData2, toLooseJSON } from '../testutils';

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

const rangePatterns = {
  a: '選択範囲が閉じている状態',
  b: '選択範囲が開いている状態',
  b_: '選択範囲が開いており終点が前点、始点が後点の状態',
};

const memberRangePatterns = {
  a: '共同編集者選択範囲が編集者と同じ位置の状態',
  b: '共同編集者選択範囲が閉じており、編集者選択範囲前点前にある状態',
  c: '共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲中にある状態',
  c_: '共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲中にある状態',
  d: '共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲後点後にある状態',
  d_: '共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲後点後にある状態',
  e: '共同編集者選択範囲が閉じており、編集者選択範囲中にある状態',
  f: '共同編集者選択範囲が開いており、始点が編集者選択範囲中、終点が編集者選択範囲後にある状態',
  f_: '共同編集者選択範囲が開いており、終点が編集者選択範囲中、始点が編集者選択範囲後にある状態',
  g: '共同編集者選択範囲が閉じており、編集者選択範囲後点後にある状態',
  h: '共同編集者選択範囲が干渉しない状態',
};

const inlinePatterns = {
  a: '単一インライン',
  b: '複数インラインで隣接するインラインにある状態',
  c: '複数インラインで間にインラインを跨ぐ状態',
};

describe('削除操作', () => {
  describe('インライン選択状態', () => {
    describe(`${rangePatterns.a}`, () => {
      describe('編集者選択範囲始点および終点が先頭の場合', () => {
        describe('段落項目以外の場合', () => {
          it('選択範囲項目が段落項目へ変換されていること', () => {
            const result = createSampleData2();
            user = result.user;
            member = result.member;
            userBoardHandler = result.userBoardHandler;
            memberBoardHandler = result.memberBoardHandler;

            userBoardHandler.change((board) => {
              const selection = board.users[user.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
              }
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const item = expectedDoc.data.document.items[0];
            const userSelection = expectedDoc.data.users[user.id];
            item.type = 'paragraph';
            userSelection.range.anchor.offset = 0;
            userSelection.range.focus.offset = 0;

            userBoardHandler.change((board) => {
              usecases(user.id, board).remove();
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('選択範囲項目が段落項目へ変換されていること(子項目)', () => {
            const result = createSampleData2();
            user = result.user;
            member = result.member;
            userBoardHandler = result.userBoardHandler;
            memberBoardHandler = result.memberBoardHandler;

            userBoardHandler.change((board) => {
              const selection = board.users[user.id];
              const range = selection.range;

              const item = board.document.items[2];

              selection.anchor = item.id;
              selection.focus = item.id;
              if (range && item.inline) {
                range.anchor.id = item.inline[0].id;
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
                range.focus.id = item.inline[0].id;
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
              }
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const item = expectedDoc.data.document.items[2];
            const userSelection = expectedDoc.data.users[user.id];
            item.type = 'paragraph';
            userSelection.range.anchor.offset = 0;
            userSelection.range.focus.offset = 0;

            userBoardHandler.change((board) => {
              usecases(user.id, board).remove();
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });

        describe('段落項目で親要素がドキュメントじゃない場合', () => {
          it('選択範囲項目が段落項目へ変換されていること', () => {
            const result = createSampleData2();
            user = result.user;
            member = result.member;
            userBoardHandler = result.userBoardHandler;
            memberBoardHandler = result.memberBoardHandler;

            userBoardHandler.change((board) => {
              const selection = board.users[user.id];
              const range = selection.range;

              const item = board.document.items[2];

              selection.anchor = item.id;
              selection.focus = item.id;
              if (range && item.inline) {
                range.anchor.id = item.inline[0].id;
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
                range.focus.id = item.inline[0].id;
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
              }
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const item = expectedDoc.data.document.items[2];
            const userSelection = expectedDoc.data.users[user.id];
            item.type = 'paragraph';
            userSelection.range.anchor.offset = 0;
            userSelection.range.focus.offset = 0;

            userBoardHandler.change((board) => {
              usecases(user.id, board).remove();
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });

        describe('段落項目で親要素がドキュメントの場合', () => {
          describe('上項目がインラインを持つ場合', () => {
            it.skip('上項目インラインと選択範囲項目インラインが結合していること', () => {});
          });

          describe('上項目がインラインを持たない場合', () => {
            it.skip('上項目が削除されていること', () => {});
          });
        });
      });

      describe('編集者選択範囲始点および終点が先頭でない場合', () => {
        describe(`${memberRangePatterns.a}`, () => {
          it('1文字削除され、編集者と共同編集者の選択範囲始点と終点が1文字前へ移動していること', () => {
            userBoardHandler.change((board) => {
              const selection = board.users[user.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
              }
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((board) => {
              const selection = board.users[member.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
              }
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const inlineText = expectedDoc.data.document.items[0].inline[0];
            const userSelection = expectedDoc.data.users[user.id];
            const memberSelection = expectedDoc.data.users[member.id];
            inlineText.text = 'ABCDFGHI'.split('');
            userSelection.range.anchor.offset = 4;
            userSelection.range.focus.offset = 4;
            memberSelection.range.anchor.offset = 4;
            memberSelection.range.focus.offset = 4;

            userBoardHandler.change((board) => {
              usecases(user.id, board).remove();
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('末尾1文字削除され、編集者選択範囲始点と終点のみが1文字前へ移動していること', () => {
            userBoardHandler.change((board) => {
              const selection = board.users[user.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 9));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 9));
              }
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((board) => {
              const selection = board.users[member.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 9));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 9));
              }
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const inlineText = expectedDoc.data.document.items[0].inline[0];
            const userSelection = expectedDoc.data.users[user.id];
            const memberSelection = expectedDoc.data.users[member.id];
            inlineText.text = 'ABCDEFGH'.split('');
            userSelection.range.anchor.offset = 8;
            userSelection.range.focus.offset = 8;
            memberSelection.range.anchor.offset = 8;
            memberSelection.range.focus.offset = 8;

            userBoardHandler.change((board) => {
              usecases(user.id, board).remove();
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('1文字削除され、編集者選択範囲のみの始点と終点が1文字前へ移動していること', () => {
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
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
          inlineText.text = 'ABCDEFGH'.split('');
          userSelection.range.anchor.offset = 8;
          userSelection.range.focus.offset = 8;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('1文字削除され、編集者選択範囲始点と終点が1文字前へ移動し、共同編集者選択範囲終点が1文字前へ移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 7));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCDFGHI'.split('');
          userSelection.range.anchor.offset = 4;
          userSelection.range.focus.offset = 4;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 6;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('1文字削除され、編集者選択範囲始点と終点が1文字前へ移動し、共同編集者選択範囲始点が1文字前へ移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 7));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCDFGHI'.split('');
          userSelection.range.anchor.offset = 4;
          userSelection.range.focus.offset = 4;
          memberSelection.range.anchor.offset = 6;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('1文字削除され、編集者および共同編集者の選択範囲始点と終点が1文字前へ移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 7));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 7));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const inlineText = expectedDoc.data.document.items[0].inline[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          inlineText.text = 'ABCDFGHI'.split('');
          userSelection.range.anchor.offset = 4;
          userSelection.range.focus.offset = 4;
          memberSelection.range.anchor.offset = 6;
          memberSelection.range.focus.offset = 6;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.h}`, () => {
        it('1文字削除され、編集者選択範囲のみの始点と終点が1文字前へ移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          item.inline[0].text = 'AC'.split('');
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });
  });

  describe(`${rangePatterns.b}`, () => {
    describe(`${inlinePatterns.a}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'CDEFGHI'.split('');
          userSelection.range.anchor.offset = 0;
          userSelection.range.focus.offset = 0;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.offset = 0;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響がないこと', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が編集者選択範囲に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が編集者選択範囲に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が削除文字数分に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 4;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が削除文字数分に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が編集者選択範囲始点に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動しており、共同編集者選択範囲終点が削除範囲と重複している文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 4;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動しており、共同編集者選択範囲終点が削除範囲と重複している文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 4;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });

    describe(`${inlinePatterns.b}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'A'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている(末尾)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          userSelection.range.anchor.id = item.inline[2].id;
          userSelection.range.anchor.offset = 0;
          userSelection.range.focus.id = item.inline[2].id;
          userSelection.range.focus.offset = 0;
          memberSelection.range.anchor.id = item.inline[2].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = item.inline[2].id;
          memberSelection.range.focus.offset = 0;
          item.inline.splice(0, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 1);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 1);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 1);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること(前インライン上)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること(後インライン上)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.h}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });

    describe(`${inlinePatterns.c}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響しない', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 0;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく、終点が編集者選択範囲始点に移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲終点に影響がなく、始点が編集者選択範囲始点に移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 0;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく、終点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲終点に影響がなく、始点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲終点が編集者選択範囲始点に移動し、始点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });
  });

  describe(`${rangePatterns.b_}`, () => {
    describe(`${inlinePatterns.a}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'CDEFGHI'.split('');
          userSelection.range.anchor.offset = 0;
          userSelection.range.focus.offset = 0;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.offset = 0;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響がないこと', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が編集者選択範囲に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が編集者選択範囲に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が削除文字数分に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 4;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が削除文字数分に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が編集者選択範囲始点に移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動しており、共同編集者選択範囲終点が削除範囲と重複している文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 4;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動しており、共同編集者選択範囲終点が削除範囲と重複している文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 3;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const selection = board.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const selection = board.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[0];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 4;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });

    describe(`${inlinePatterns.b}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'A'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている(末尾)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          userSelection.range.anchor.id = item.inline[2].id;
          userSelection.range.anchor.offset = 0;
          userSelection.range.focus.id = item.inline[2].id;
          userSelection.range.focus.offset = 0;
          memberSelection.range.anchor.id = item.inline[2].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = item.inline[2].id;
          memberSelection.range.focus.offset = 0;
          item.inline.splice(0, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 1);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 1);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 1);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること(前インライン上)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること(後インライン上)', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = item.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.h}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が後インライン削除文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          item.inline[0].text = 'AB'.split('');
          item.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 2;

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });

    describe(`${inlinePatterns.c}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響しない', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 0;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく、終点が編集者選択範囲始点に移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲終点に影響がなく、始点が編集者選択範囲始点に移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 0));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 0;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく、終点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲終点に影響がなく、始点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲終点が編集者選択範囲始点に移動し、始点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 1;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が削除された文字数分移動していること', () => {
          userBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[user.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = item.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((board) => {
            const item = board.document.items[2];
            const selection = board.users[member.id];
            const range = selection.range;

            selection.anchor = item.id;
            selection.focus = item.id;
            if (range && item.inline) {
              range.anchor.id = item.inline[2].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = item.inline[2].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const item = expectedDoc.data.document.items[2];
          const userSelection = expectedDoc.data.users[user.id];
          const memberSelection = expectedDoc.data.users[member.id];
          item.inline[0].text = 'AI'.split('');
          userSelection.range.anchor.id = item.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = item.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = item.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = item.inline[0].id;
          memberSelection.range.focus.offset = 2;
          item.inline.splice(1, 2);

          userBoardHandler.change((board) => {
            usecases(user.id, board).remove();
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });
  });
});
