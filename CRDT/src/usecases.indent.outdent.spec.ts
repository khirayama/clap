import * as assert from 'power-assert';

import { usecases } from './usecases';
import { CRDTDocument } from './CRDTDocument';
import { createSampleData, toLooseJSON } from './testutils';

let user: { id: string };
let userDoc: CRDTDocument;

beforeEach(() => {
  const result = createSampleData();
  user = result.user;
  userDoc = result.userDoc;
});

describe.only('インデント操作', () => {
  describe('前項目がない場合', () => {
    it('何も変更されないこと', () => {
      const expectedDoc = toLooseJSON(userDoc);

      userDoc.change((doc) => {
        usecases(user.id, doc).indent();
      });

      assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
    });
  });

  describe('前項目がある場合', () => {
    describe('選択項目子項目がないもしくは空の場合', () => {
      it('選択項目が前項目の子項目最後尾に追加されていること', () => {
        userDoc.change((doc) => {
          if (
            !(
              doc.document.nodes[0] &&
              doc.document.nodes[0].nodes &&
              doc.document.nodes[0].nodes[0] &&
              doc.document.nodes[0].nodes[0].nodes &&
              doc.document.nodes[0].nodes[0].nodes[1] !== null
            )
          )
            return;

          const node = doc.document.nodes[0].nodes[0].nodes[1]; // Paragraph4

          doc.users[user.id].anchor = node.id;
          doc.users[user.id].focus = node.id;
          doc.users[user.id].range = null;
        });

        const expectedDoc = toLooseJSON(userDoc);
        const nodes = expectedDoc.doc.document.nodes[0].nodes[0].nodes;
        const tmp = nodes.splice(1, 1)[0];
        nodes[0].nodes.push(tmp);
        tmp.prev = null;
        tmp.parent = nodes[0].id;
        nodes[0].next = null;

        userDoc.change((doc) => {
          usecases(user.id, doc).indent();
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });

    describe('選択項目子項目がある場合', () => {
      it('選択項目が前項目の子項目最後尾に追加され、選択項目子項目全ても前項目の子項目に追加されていること', () => {
        userDoc.change((doc) => {
          if (doc.document.nodes[2] === null) return;

          const node = doc.document.nodes[2]; // Paragraph6

          doc.users[user.id].anchor = node.id;
          doc.users[user.id].focus = node.id;
          doc.users[user.id].range = null;
        });

        const expectedDoc = toLooseJSON(userDoc);
        const nodes = expectedDoc.doc.document.nodes;
        const tmp = nodes.splice(2, 1)[0];
        nodes[1].nodes.push(tmp);
        nodes[1].nodes.push(tmp.nodes[0]);
        tmp.nodes = [];
        nodes[1].next = nodes[2].id;
        nodes[2].prev = nodes[1].id;
        nodes[1].nodes[0].parent = nodes[1].id;
        nodes[1].nodes[0].prev = null;
        nodes[1].nodes[0].next = nodes[1].nodes[1].id;
        nodes[1].nodes[1].parent = nodes[1].id;
        nodes[1].nodes[1].prev = nodes[1].nodes[0].id;
        nodes[1].nodes[1].next = null;

        userDoc.change((doc) => {
          usecases(user.id, doc).indent();
        });

        assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
      });
    });
  });
});

describe.only('アウトデント操作', () => {
  describe('親項目がない場合', () => {
    it('何も変更されないこと', () => {
      const expectedDoc = toLooseJSON(userDoc);

      userDoc.change((doc) => {
        usecases(user.id, doc).outdent();
      });

      assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
    });
  });

  describe('親項目がある場合', () => {
    describe('選択項目次項目がない場合', () => {
      it.skip('選択項目が前項目の子項目最後尾に追加されていること', () => {});
    });

    describe('選択項目次項目がある場合', () => {
      it.skip('選択項目が前項目の子項目最後尾に追加され、選択項目子項目全ても前項目の子項目に追加されていること', () => {});
    });
  });
});
