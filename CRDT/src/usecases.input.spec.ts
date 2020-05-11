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
            usecases.input(user.id, doc, ['J']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
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
            usecases.input(user.id, doc, ['J', 'K', 'L']);
          });
          memberDoc.merge(userDoc);

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
    });

    describe('選択範囲が開いている状態', () => {
      it('選択範囲の文字列が削除され、任意文字が入力されていること', () => {});
      it.skip('このケースは、removeとの組み合わせであり、上記のケースのみのテストに留める', () => {});
    });
  });

  describe('項目選択状態', () => {
    it('選択項目が先頭以外削除され、先頭は段落項目へ置換され、段落項目インラインに任意文字列が入力されていること', () => {});
    it.skip('このケースは、removeとの組み合わせであり、上記のケースのみのテストに留める', () => {});
  });
});
