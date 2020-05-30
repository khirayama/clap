import * as assert from 'power-assert';

import { usecases } from '../usecases';
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

const nodePatterns = {
  a: '単一項目を選択している状態',
  b: '複数項目を選択している状態',
};

describe('削除操作', () => {
  describe('項目選択状態の場合', () => {
    describe(`編集者選択範囲が${nodePatterns.a}`, () => {
      describe(`共同編集者選択範囲が${nodePatterns.a}`, () => {
        it('項目が削除され、編集者と共同編集者の選択範囲が次項目へ移動していること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].range = null;
          });

          const expectedDoc = toLooseJSON(userBoardHandler);
          const items = expectedDoc.data.document.items;
          expectedDoc.data.users[user.id].anchor = items[1].id;
          expectedDoc.data.users[user.id].focus = items[1].id;
          expectedDoc.data.users[member.id].anchor = items[1].id;
          expectedDoc.data.users[member.id].focus = items[1].id;
          expectedDoc.data.users[member.id].range = null;
          items.splice(0, 1);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('項目が削除され、編集者と共同編集者の選択範囲が次項目へ移動していること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].anchor = doc.document.items[4].id;
            doc.users[user.id].focus = doc.document.items[4].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].anchor = doc.document.items[4].id;
            doc.users[member.id].focus = doc.document.items[4].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const items = expectedDoc.data.document.items;
          expectedDoc.data.users[user.id].anchor = items[5].id;
          expectedDoc.data.users[user.id].focus = items[5].id;
          expectedDoc.data.users[member.id].anchor = items[5].id;
          expectedDoc.data.users[member.id].focus = items[5].id;
          items.splice(4, 1);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('項目が削除され、編集者と共同編集者の選択範囲が前項目へ移動していること(末尾)', () => {
          userBoardHandler.change((doc) => {
            if (!doc.document.items) return;

            doc.users[user.id].anchor = doc.document.items[11].id;
            doc.users[user.id].focus = doc.document.items[11].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            if (!doc.document.items) return;

            doc.users[member.id].anchor = doc.document.items[11].id;
            doc.users[member.id].focus = doc.document.items[11].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const node = expectedDoc.data.document.items[10];
          expectedDoc.data.users[user.id].anchor = node.id;
          expectedDoc.data.users[user.id].focus = node.id;
          expectedDoc.data.users[member.id].anchor = node.id;
          expectedDoc.data.users[member.id].focus = node.id;
          expectedDoc.data.document.items.splice(11, 1);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('項目が削除され、編集者と共同編集者の選択範囲がなくなっていること', () => {
          userBoardHandler.change((doc) => {
            doc.document.items.splice(1, doc.document.items.length - 1);

            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          expectedDoc.data.document.items = [];
          expectedDoc.data.users[user.id].anchor = null;
          expectedDoc.data.users[user.id].focus = null;
          expectedDoc.data.users[member.id].anchor = null;
          expectedDoc.data.users[member.id].focus = null;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`共同編集者選択範囲が${nodePatterns.b}`, () => {
        it('項目が削除され、編集者選択範囲が次項目へ移動し、共同編集者選択項目から項目が取り除かれていること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].range = null;
            doc.users[member.id].anchor = doc.document.items[0].id;
            doc.users[member.id].focus = doc.document.items[4].id;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const items = expectedDoc.data.document.items;
          expectedDoc.data.users[user.id].anchor = items[1].id;
          expectedDoc.data.users[user.id].focus = items[1].id;
          expectedDoc.data.users[member.id].anchor = items[1].id;
          expectedDoc.data.users[member.id].focus = items[4].id;
          expectedDoc.data.users[member.id].range = null;
          items.splice(0, 1);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('項目が削除され、編集者選択範囲が次項目へ移動し、共同編集者選択項目から項目が取り除かれていること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].anchor = doc.document.items[4].id;
            doc.users[user.id].focus = doc.document.items[4].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].anchor = doc.document.items[0].id;
            doc.users[member.id].focus = doc.document.items[4].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const items = expectedDoc.data.document.items;
          expectedDoc.data.users[user.id].anchor = items[5].id;
          expectedDoc.data.users[user.id].focus = items[5].id;
          expectedDoc.data.users[member.id].anchor = items[0].id;
          expectedDoc.data.users[member.id].focus = items[3].id;
          items.splice(4, 1);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });
    });

    describe(`編集者選択範囲が${nodePatterns.b}`, () => {
      describe(`共同編集者選択範囲が${nodePatterns.a}`, () => {
        it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目へ移動していること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].anchor = doc.document.items[1].id;
            doc.users[user.id].focus = doc.document.items[3].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].anchor = doc.document.items[1].id;
            doc.users[member.id].focus = doc.document.items[1].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const items = expectedDoc.data.document.items;
          expectedDoc.data.users[user.id].anchor = items[4].id;
          expectedDoc.data.users[user.id].focus = items[4].id;
          expectedDoc.data.users[member.id].anchor = items[4].id;
          expectedDoc.data.users[member.id].focus = items[4].id;
          items.splice(1, 3);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目へ移動していること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].anchor = doc.document.items[2].id;
            doc.users[user.id].focus = doc.document.items[4].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].anchor = doc.document.items[2].id;
            doc.users[member.id].focus = doc.document.items[2].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const items = expectedDoc.data.document.items;
          expectedDoc.data.users[user.id].anchor = items[5].id;
          expectedDoc.data.users[user.id].focus = items[5].id;
          expectedDoc.data.users[member.id].anchor = items[5].id;
          expectedDoc.data.users[member.id].focus = items[5].id;
          items.splice(2, 3);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('複数項目が削除され、編集者と共同編集者の選択範囲が上項目へ移動していること', () => {
          userBoardHandler.change((doc) => {
            if (!doc.document.items) return;

            doc.users[user.id].anchor = doc.document.items[2].id;
            doc.users[user.id].focus = doc.document.items[3].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            if (!doc.document.items) return;

            doc.users[member.id].anchor = doc.document.items[2].id;
            doc.users[member.id].focus = doc.document.items[2].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          const node = expectedDoc.data.document.items[4];
          expectedDoc.data.users[user.id].anchor = node.id;
          expectedDoc.data.users[user.id].focus = node.id;
          expectedDoc.data.users[member.id].anchor = node.id;
          expectedDoc.data.users[member.id].focus = node.id;
          expectedDoc.data.document.items.splice(2, 2);

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });

        it('複数項目が削除され、編集者と共同編集者の選択範囲がなくなっていること', () => {
          userBoardHandler.change((doc) => {
            doc.users[user.id].anchor = doc.document.items[0].id;
            doc.users[user.id].focus = doc.document.items[11].id;
            doc.users[user.id].range = null;
          });
          memberBoardHandler.merge(userBoardHandler.save(), user.id);
          memberBoardHandler.change((doc) => {
            doc.users[member.id].anchor = doc.document.items[0].id;
            doc.users[member.id].focus = doc.document.items[0].id;
            doc.users[member.id].range = null;
          });
          userBoardHandler.merge(memberBoardHandler.save(), member.id);

          const expectedDoc = toLooseJSON(userBoardHandler);
          expectedDoc.data.document.items = [];
          expectedDoc.data.users[user.id].anchor = null;
          expectedDoc.data.users[user.id].focus = null;
          expectedDoc.data.users[member.id].anchor = null;
          expectedDoc.data.users[member.id].focus = null;

          userBoardHandler.change((doc) => {
            usecases(user.id, doc).remove();
          });

          assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
        });
      });

      describe(`共同編集者選択範囲が${nodePatterns.b}`, () => {
        describe('編集者と共同編集者が同じ選択範囲の場合', () => {
          it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目に移動していること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[1].id;
              doc.users[user.id].focus = doc.document.items[3].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[1].id;
              doc.users[member.id].focus = doc.document.items[3].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[4].id;
            expectedDoc.data.users[user.id].focus = items[4].id;
            expectedDoc.data.users[member.id].anchor = items[4].id;
            expectedDoc.data.users[member.id].focus = items[4].id;
            items.splice(1, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目に移動していること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[4].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[2].id;
              doc.users[member.id].focus = doc.document.items[4].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[5].id;
            expectedDoc.data.users[user.id].focus = items[5].id;
            expectedDoc.data.users[member.id].anchor = items[5].id;
            expectedDoc.data.users[member.id].focus = items[5].id;
            items.splice(2, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者と共同編集者の選択範囲が親項目に移動していること', () => {
            userBoardHandler.change((doc) => {
              if (!doc.document.items) return;

              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[3].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              if (!doc.document.items) return;

              doc.users[member.id].anchor = doc.document.items[2].id;
              doc.users[member.id].focus = doc.document.items[3].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const node = expectedDoc.data.document.items[4];
            expectedDoc.data.users[user.id].anchor = node.id;
            expectedDoc.data.users[user.id].focus = node.id;
            expectedDoc.data.users[member.id].anchor = node.id;
            expectedDoc.data.users[member.id].focus = node.id;
            expectedDoc.data.document.items.splice(2, 2);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者と共同編集者の選択項目がなくなっていること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[0].id;
              doc.users[user.id].anchor = doc.document.items[11].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[0].id;
              doc.users[member.id].anchor = doc.document.items[11].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            expectedDoc.data.document.items = [];
            expectedDoc.data.users[user.id].anchor = null;
            expectedDoc.data.users[user.id].focus = null;
            expectedDoc.data.users[member.id].anchor = null;
            expectedDoc.data.users[member.id].focus = null;

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });

        describe('編集者選択範囲前に共同編集者選択範囲がある場合', () => {
          it('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目に影響がないこと', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[3].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[0].id;
              doc.users[member.id].anchor = doc.document.items[1].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[4].id;
            expectedDoc.data.users[user.id].focus = items[4].id;
            items.splice(2, 2);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目に影響がないこと', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[4].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[0].id;
              doc.users[member.id].anchor = doc.document.items[1].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[5].id;
            expectedDoc.data.users[user.id].focus = items[5].id;
            items.splice(2, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });

        describe('編集者選択範囲内に共同編集者選択範囲がある場合', () => {
          it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目に移動していること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[1].id;
              doc.users[user.id].focus = doc.document.items[3].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[2].id;
              doc.users[member.id].focus = doc.document.items[3].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[4].id;
            expectedDoc.data.users[user.id].focus = items[4].id;
            expectedDoc.data.users[member.id].anchor = items[4].id;
            expectedDoc.data.users[member.id].focus = items[4].id;
            items.splice(1, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目に移動していること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[4].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[3].id;
              doc.users[member.id].focus = doc.document.items[4].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[5].id;
            expectedDoc.data.users[user.id].focus = items[5].id;
            expectedDoc.data.users[member.id].anchor = items[5].id;
            expectedDoc.data.users[member.id].focus = items[5].id;
            items.splice(2, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者と共同編集者の選択範囲が親項目に移動していること', () => {
            userBoardHandler.change((doc) => {
              if (!doc.document.items) return;

              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[3].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              if (!doc.document.items) return;

              doc.users[member.id].anchor = doc.document.items[3].id;
              doc.users[member.id].focus = doc.document.items[3].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const node = expectedDoc.data.document.items[4];
            expectedDoc.data.users[user.id].anchor = node.id;
            expectedDoc.data.users[user.id].focus = node.id;
            expectedDoc.data.users[member.id].anchor = node.id;
            expectedDoc.data.users[member.id].focus = node.id;
            expectedDoc.data.document.items.splice(2, 2);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者と共同編集者の選択項目がなくなっていること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[0].id;
              doc.users[user.id].focus = doc.document.items[11].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[1].id;
              doc.users[member.id].focus = doc.document.items[3].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            expectedDoc.data.users[user.id].anchor = null;
            expectedDoc.data.users[user.id].focus = null;
            expectedDoc.data.users[member.id].anchor = null;
            expectedDoc.data.users[member.id].focus = null;
            expectedDoc.data.document.items = [];

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });

        describe('編集者選択範囲と共同編集者選択範囲に一部重複がある場合', () => {
          it('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目の重複項目が削除されていること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[1].id;
              doc.users[user.id].focus = doc.document.items[3].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[0].id;
              doc.users[member.id].focus = doc.document.items[1].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[4].id;
            expectedDoc.data.users[user.id].focus = items[4].id;
            expectedDoc.data.users[member.id].anchor = items[0].id;
            expectedDoc.data.users[member.id].focus = items[0].id;
            items.splice(1, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });

          it('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目の重複項目が削除されていること', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[2].id;
              doc.users[user.id].focus = doc.document.items[4].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[1].id;
              doc.users[member.id].focus = doc.document.items[2].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[5].id;
            expectedDoc.data.users[user.id].focus = items[5].id;
            expectedDoc.data.users[member.id].anchor = items[1].id;
            expectedDoc.data.users[member.id].focus = items[1].id;
            items.splice(2, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });

        describe('編集者選択範囲後に共同編集者選択範囲がある場合', () => {
          it('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目に影響がないこと', () => {
            userBoardHandler.change((doc) => {
              doc.users[user.id].anchor = doc.document.items[0].id;
              doc.users[user.id].focus = doc.document.items[2].id;
              doc.users[user.id].range = null;
            });
            memberBoardHandler.merge(userBoardHandler.save(), user.id);
            memberBoardHandler.change((doc) => {
              doc.users[member.id].anchor = doc.document.items[3].id;
              doc.users[member.id].focus = doc.document.items[4].id;
              doc.users[member.id].range = null;
            });
            userBoardHandler.merge(memberBoardHandler.save(), member.id);

            const expectedDoc = toLooseJSON(userBoardHandler);
            const items = expectedDoc.data.document.items;
            expectedDoc.data.users[user.id].anchor = items[3].id;
            expectedDoc.data.users[user.id].focus = items[3].id;
            items.splice(0, 3);

            userBoardHandler.change((doc) => {
              usecases(user.id, doc).remove();
            });

            assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
          });
        });
      });
    });
  });
});
