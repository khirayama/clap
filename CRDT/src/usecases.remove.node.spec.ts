import * as assert from 'power-assert';

import { usecases } from './usecases';
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

const nodePatterns = {
  a: '単一項目を選択している状態',
  b: '複数項目を選択している状態',
};

describe('削除操作', () => {
  describe('項目選択状態の場合', () => {
    describe(`編集者選択範囲が${nodePatterns.a}`, () => {
      describe(`共同編集者選択範囲が${nodePatterns.a}`, () => {
        it('項目が削除され、編集者と共同編集者の選択範囲が次項目へ移動していること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].range = null;
          });

          const expectedDoc = toLooseJSON(userDoc);
          const nodes = expectedDoc.doc.document.nodes;
          nodes[1].prev = null;
          expectedDoc.doc.users[user.id].ids = [nodes[1].id];
          expectedDoc.doc.users[member.id].ids = [nodes[1].id];
          expectedDoc.doc.users[member.id].range = null;
          nodes.splice(0, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('項目が削除され、編集者と共同編集者の選択範囲が前項目へ移動していること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [doc.document.nodes[4].id];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].ids = [doc.document.nodes[4].id];
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const nodes = expectedDoc.doc.document.nodes;
          nodes[3].next = null;
          expectedDoc.doc.users[user.id].ids = [nodes[3].id];
          expectedDoc.doc.users[member.id].ids = [nodes[3].id];
          nodes.splice(4, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('項目が削除され、編集者と共同編集者の選択範囲が親項目へ移動していること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [doc.document.nodes[2].nodes[0].nodes[0].id];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].ids = [doc.document.nodes[2].nodes[0].nodes[0].id];
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[2].nodes[0];
          node.nodes = [];
          expectedDoc.doc.users[user.id].ids = [node.id];
          expectedDoc.doc.users[member.id].ids = [node.id];

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('項目が削除され、編集者と共同編集者の選択範囲がなくなっていること', () => {
          userDoc.change((doc) => {
            doc.document.nodes.splice(1, 4);
            doc.document.nodes[0].next = null;

            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          expectedDoc.doc.document.nodes = [];
          expectedDoc.doc.users[user.id].ids = [];
          expectedDoc.doc.users[member.id].ids = [];

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });

      describe(`共同編集者選択範囲が${nodePatterns.b}`, () => {
        it('項目が削除され、編集者選択範囲が次項目へ移動し、共同編集者選択項目から項目が取り除かれていること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].range = null;
            doc.users[member.id].ids = [
              doc.document.nodes[0].id,
              doc.document.nodes[1].id,
              doc.document.nodes[2].id,
              doc.document.nodes[3].id,
              doc.document.nodes[4].id,
            ];
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const nodes = expectedDoc.doc.document.nodes;
          nodes[1].prev = null;
          expectedDoc.doc.users[user.id].ids = [nodes[1].id];
          expectedDoc.doc.users[member.id].ids = [nodes[1].id, nodes[2].id, nodes[3].id, nodes[4].id];
          expectedDoc.doc.users[member.id].range = null;
          nodes.splice(0, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('項目が削除され、編集者選択範囲が前項目へ移動し、共同編集者選択項目から項目が取り除かれていること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [doc.document.nodes[4].id];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].range = null;
            doc.users[member.id].ids = [
              doc.document.nodes[0].id,
              doc.document.nodes[1].id,
              doc.document.nodes[2].id,
              doc.document.nodes[3].id,
              doc.document.nodes[4].id,
            ];
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const nodes = expectedDoc.doc.document.nodes;
          nodes[3].next = null;
          expectedDoc.doc.users[user.id].ids = [nodes[3].id];
          expectedDoc.doc.users[member.id].ids = [nodes[0].id, nodes[1].id, nodes[2].id, nodes[3].id];
          nodes.splice(4, 1);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
    });
    describe(`編集者選択範囲が${nodePatterns.b}`, () => {
      describe(`共同編集者選択範囲が${nodePatterns.a}`, () => {
        it('複数項目が削除され、編集者と共同編集者の選択範囲が次項目へ移動していること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [doc.document.nodes[1].id, doc.document.nodes[2].id, doc.document.nodes[3].id];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].ids = [doc.document.nodes[1].id];
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const nodes = expectedDoc.doc.document.nodes;
          nodes[0].next = nodes[4].id;
          nodes[4].prev = nodes[0].id;
          expectedDoc.doc.users[user.id].ids = [nodes[4].id];
          expectedDoc.doc.users[member.id].ids = [nodes[4].id];
          nodes.splice(1, 3);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('複数項目が削除され、編集者と共同編集者の選択範囲が前項目へ移動していること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [doc.document.nodes[2].id, doc.document.nodes[3].id, doc.document.nodes[4].id];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].ids = [doc.document.nodes[2].id];
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const nodes = expectedDoc.doc.document.nodes;
          nodes[1].next = null;
          expectedDoc.doc.users[user.id].ids = [nodes[1].id];
          expectedDoc.doc.users[member.id].ids = [nodes[1].id];
          nodes.splice(2, 3);

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('複数項目が削除され、編集者と共同編集者の選択範囲が親項目へ移動していること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [
              doc.document.nodes[0].nodes[0].nodes[0].id,
              doc.document.nodes[0].nodes[0].nodes[1].id,
            ];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].ids = [doc.document.nodes[0].nodes[0].nodes[0].id];
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          const node = expectedDoc.doc.document.nodes[0].nodes[0];
          node.nodes = [];
          expectedDoc.doc.users[user.id].ids = [node.id];
          expectedDoc.doc.users[member.id].ids = [node.id];

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });

        it('複数項目が削除され、編集者と共同編集者の選択範囲がなくなっていること', () => {
          userDoc.change((doc) => {
            doc.users[user.id].ids = [
              doc.document.nodes[0].id,
              doc.document.nodes[1].id,
              doc.document.nodes[2].id,
              doc.document.nodes[3].id,
              doc.document.nodes[4].id,
            ];
            doc.users[user.id].range = null;
          });
          memberDoc.merge(userDoc);
          memberDoc.change((doc) => {
            doc.users[member.id].ids = [doc.document.nodes[0].id];
            doc.users[member.id].range = null;
          });
          userDoc.merge(memberDoc);

          const expectedDoc = toLooseJSON(userDoc);
          expectedDoc.doc.document.nodes = [];
          expectedDoc.doc.users[user.id].ids = [];
          expectedDoc.doc.users[member.id].ids = [];

          userDoc.change((doc) => {
            usecases.remove(user.id, doc);
          });

          assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
        });
      });
      describe(`共同編集者選択範囲が${nodePatterns.b}`, () => {
        describe('編集者と共同編集者が同じ選択範囲の場合', () => {
          it.skip('複数項目が削除され、編集者と共同編集者の選択範囲が次項目に移動していること', () => {});
          it.skip('複数項目が削除され、編集者と共同編集者の選択範囲が前項目に移動していること', () => {});
          it.skip('複数項目が削除され、編集者と共同編集者の選択範囲が親項目に移動していること', () => {});
          it.skip('複数項目が削除され、編集者と共同編集者の選択項目がなくなっていること', () => {});
        });
        describe('編集者選択範囲前に共同編集者選択範囲がある場合', () => {
          it.skip('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目に影響がないこと', () => {});
          it.skip('複数項目が削除され、編集者の選択範囲が前項目に移動し、共同編集者選択項目に影響がないこと', () => {});
        });
        describe('編集者選択範囲内に共同編集者選択範囲がある場合', () => {
          it.skip('複数項目が削除され、編集者と共同編集者の選択範囲が次項目に移動していること', () => {});
          it.skip('複数項目が削除され、編集者と共同編集者の選択範囲が前項目に移動していること', () => {});
          it.skip('複数項目が削除され、編集者と共同編集者の選択範囲が親項目に移動していること', () => {});
          it.skip('複数項目が削除され、編集者と共同編集者の選択項目がなくなっていること', () => {});
        });
        describe('編集者選択範囲と共同編集者選択範囲に一部重複がある場合', () => {
          it.skip('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目の重複項目が削除されていること', () => {});
          it.skip('複数項目が削除され、編集者の選択範囲が前項目に移動し、共同編集者選択項目の重複項目が削除されていること', () => {});
        });
        describe('編集者選択範囲後に共同編集者選択範囲がある場合', () => {
          it.skip('複数項目が削除され、編集者の選択範囲が次項目に移動し、共同編集者選択項目に影響がないこと', () => {});
          it.skip('複数項目が削除され、編集者の選択範囲が前項目に移動し、共同編集者選択項目に影響がないこと', () => {});
          it.skip('', () => {});
        });
      });
    });
  });
});
