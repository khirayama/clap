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
          it.skip('選択範囲項目が段落項目へ変換されていること', () => {});
        });

        describe('段落項目で親要素がドキュメントじゃない場合', () => {
          it.skip('アウトデントされていること', () => {});
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
            userDoc.change((doc) => {
              const selection = doc.users[user.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
              }
            });
            memberDoc.merge(userDoc);
            memberDoc.change((doc) => {
              const selection = doc.users[member.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
              }
            });
            userDoc.merge(memberDoc);

            const expectedDoc = toLooseJSON(userDoc);
            const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
            const userSelection = expectedDoc.doc.users[user.id];
            const memberSelection = expectedDoc.doc.users[member.id];
            inlineText.text = 'ABCDFGHI'.split('');
            userSelection.range.anchor.offset = 4;
            userSelection.range.focus.offset = 4;
            memberSelection.range.anchor.offset = 4;
            memberSelection.range.focus.offset = 4;

            userDoc.change((doc) => {
              usecases.remove(user.id, doc);
            });
            memberDoc.merge(userDoc);

            assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
          });

          it('末尾1文字削除され、編集者選択範囲始点と終点のみが1文字前へ移動していること', () => {
            userDoc.change((doc) => {
              const selection = doc.users[user.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 9));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 9));
              }
            });
            memberDoc.merge(userDoc);
            memberDoc.change((doc) => {
              const selection = doc.users[member.id];
              const range = selection.range;

              if (range) {
                range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 9));
                range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 9));
              }
            });
            userDoc.merge(memberDoc);

            const expectedDoc = toLooseJSON(userDoc);
            const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
            const userSelection = expectedDoc.doc.users[user.id];
            const memberSelection = expectedDoc.doc.users[member.id];
            inlineText.text = 'ABCDEFGH'.split('');
            userSelection.range.anchor.offset = 8;
            userSelection.range.focus.offset = 8;
            memberSelection.range.anchor.offset = 8;
            memberSelection.range.focus.offset = 8;

            userDoc.change((doc) => {
              usecases.remove(user.id, doc);
            });
            memberDoc.merge(userDoc);

            assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
          });
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('1文字削除され、編集者選択範囲のみの始点と終点が1文字前へ移動していること', () => {
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
          inlineText.text = 'ABCDEFGH'.split('');
          userSelection.range.anchor.offset = 8;
          userSelection.range.focus.offset = 8;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('1文字削除され、編集者選択範囲始点と終点が1文字前へ移動し、共同編集者選択範囲終点が1文字前へ移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 7));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCDFGHI'.split('');
          userSelection.range.anchor.offset = 4;
          userSelection.range.focus.offset = 4;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 6;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('1文字削除され、編集者選択範囲始点と終点が1文字前へ移動し、共同編集者選択範囲始点が1文字前へ移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 7));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCDFGHI'.split('');
          userSelection.range.anchor.offset = 4;
          userSelection.range.focus.offset = 4;
          memberSelection.range.anchor.offset = 6;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('1文字削除され、編集者および共同編集者の選択範囲始点と終点が1文字前へ移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 5));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 7));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 7));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const inlineText = expectedDoc.doc.document.nodes[0].inline[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          inlineText.text = 'ABCDFGHI'.split('');
          userSelection.range.anchor.offset = 4;
          userSelection.range.focus.offset = 4;
          memberSelection.range.anchor.offset = 6;
          memberSelection.range.focus.offset = 6;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.h}`, () => {
        it('1文字削除され、編集者選択範囲のみの始点と終点が1文字前へ移動していること', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AC'.split('');
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
    });
  });

  describe(`${rangePatterns.b}`, () => {
    describe(`${inlinePatterns.a}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'CDEFGHI'.split('');
          userSelection.range.anchor.offset = 0;
          userSelection.range.focus.offset = 0;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.offset = 0;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響がないこと', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
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
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が編集者選択範囲に移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が編集者選択範囲に移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が削除文字数分に移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.offset = 4;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点に影響がなく終点が削除文字数分に移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が編集者選択範囲始点に移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動しており、共同編集者選択範囲終点が削除範囲と重複している文字数分移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 4));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 3;
          memberSelection.range.focus.offset = 4;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動しており、共同編集者選択範囲終点が削除範囲と重複している文字数分移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 4));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 3;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲が削除された文字数分移動していること', () => {
          userDoc.change((doc) => {
            const selection = doc.users[user.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 5));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const selection = doc.users[member.id];
            const range = selection.range;

            if (range) {
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 6));
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 6));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'ABCFGHI'.split('');
          userSelection.range.anchor.offset = 3;
          userSelection.range.focus.offset = 3;
          memberSelection.range.anchor.offset = 4;
          memberSelection.range.focus.offset = 4;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
    });

    describe(`${inlinePatterns.b}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'A'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 1;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 1;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('選択範囲文字が削除され、編集者選択範囲と共同編集者選択範囲が始点に閉じている(末尾)', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 0));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          userSelection.range.anchor.id = node.inline[2].id;
          userSelection.range.anchor.offset = 0;
          userSelection.range.focus.id = node.inline[2].id;
          userSelection.range.focus.offset = 0;
          memberSelection.range.anchor.id = node.inline[2].id;
          memberSelection.range.anchor.offset = 0;
          memberSelection.range.focus.id = node.inline[2].id;
          memberSelection.range.focus.offset = 0;
          node.inline.splice(0, 2);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.b}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 1;
          node.inline.splice(1, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 2;
          node.inline.splice(1, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 1;
          node.inline.splice(1, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲に影響ないこと', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.e}`, () => {
        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること(前インライン上)', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('選択範囲文字が削除され、編集者と共同編集者の選択範囲が始点に閉じていること(後インライン上)', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 1));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 1));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が後インライン削除文字数分移動していること', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[0].id;
          memberSelection.range.anchor.offset = 2;
          memberSelection.range.focus.id = node.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点が編集者選択範囲始点に移動し、終点が後インライン削除文字数分移動していること', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = node.inline[0].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[0].id;
          memberSelection.range.focus.offset = 2;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.g}`, () => {
        it('選択範囲文字が削除され、編集者選択範囲が始点に閉じており、共同編集者選択範囲始点と終点が後インライン削除文字数分移動していること', () => {
          userDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[user.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[0].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 2));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 2));
            }
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            const node = doc.document.nodes[0].nodes[0].nodes[0];
            const selection = doc.users[member.id];
            const range = selection.range;

            selection.ids = [node.id];
            if (range) {
              range.anchor.id = node.inline[1].id;
              range.anchor.offset.increment(sutils.getOffset(range.anchor.offset.value, 3));
              range.focus.id = node.inline[1].id;
              range.focus.offset.increment(sutils.getOffset(range.focus.offset.value, 3));
            }
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0].nodes[0];
          const userSelection = expectedDoc.doc.users[user.id];
          const memberSelection = expectedDoc.doc.users[member.id];
          node.inline[0].text = 'AB'.split('');
          node.inline[1].text = 'F'.split('');
          userSelection.range.anchor.id = node.inline[0].id;
          userSelection.range.anchor.offset = 2;
          userSelection.range.focus.id = node.inline[0].id;
          userSelection.range.focus.offset = 2;
          memberSelection.range.anchor.id = node.inline[1].id;
          memberSelection.range.anchor.offset = 1;
          memberSelection.range.focus.id = node.inline[1].id;
          memberSelection.range.focus.offset = 1;

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`${memberRangePatterns.h}`, () => {
        it.skip('', () => {});
      });
    });

    describe(`${inlinePatterns.c}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.b}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.e}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.g}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.h}`, () => {
        it.skip('', () => {});
      });
    });
  });

  describe(`${rangePatterns.b_}`, () => {
    describe(`${inlinePatterns.a}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.b}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.e}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.g}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.h}`, () => {
        it.skip('', () => {});
      });
    });

    describe(`${inlinePatterns.b}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.b}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.e}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.g}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.h}`, () => {
        it.skip('', () => {});
      });
    });

    describe(`${inlinePatterns.c}`, () => {
      describe(`${memberRangePatterns.a}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.b}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.c_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.d_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.e}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.f_}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.g}`, () => {
        it.skip('', () => {});
      });

      describe(`${memberRangePatterns.h}`, () => {
        it.skip('', () => {});
      });
    });
  });
});
