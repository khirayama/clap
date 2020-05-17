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

describe.only('インデント操作', () => {
  describe('前項目がない場合', () => {
    it('何も変更されないこと', () => {
      const expectedDoc = toLooseJSON(userDoc);

      userDoc.change((doc) => {
        usecases(user.id, doc).indent();
      });
      memberDoc.merge(userDoc);

      assert.deepEqual(toLooseJSON(userDoc), expectedDoc);
    });
  });

  describe('前項目がある場合', () => {
    describe('選択項目子項目がないもしくは空の場合', () => {
      it.skip('選択項目が前項目の子項目最後尾に追加されていること', () => {});
    });

    describe('選択項目子項目がある場合', () => {
      it.skip('選択項目が前項目の子項目最後尾に追加され、選択項目子項目全ても前項目の子項目に追加されていること', () => {});
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
      memberDoc.merge(userDoc);

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
