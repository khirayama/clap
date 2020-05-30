import * as assert from 'power-assert';

import { usecases } from '../usecases';
import { BoardHandler } from '../BoardHandler';
import { createSampleData, toLooseJSON } from '../testutils';

let user: { id: string };
let userBoardHandler: BoardHandler;

beforeEach(() => {
  const result = createSampleData();
  user = result.user;
  userBoardHandler = result.userBoardHandler;
});

// TODO: itの文章がデータ構造を変更したことで整合性がなくなっている。書き直す
describe('インデント操作', () => {
  describe('前項目がない場合', () => {
    it('何も変更されないこと', () => {
      const expectedDoc = toLooseJSON(userBoardHandler);

      userBoardHandler.change((board) => {
        usecases(user.id, board).indent();
      });

      assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
    });
  });

  describe('前項目がある場合', () => {
    describe('選択項目子項目がないもしくは空の場合', () => {
      it('選択項目が前項目の子項目最後尾に追加されていること', () => {
        userBoardHandler.change((board) => {
          if (!board.document.items) return;

          const node = board.document.items[3];

          board.users[user.id].anchor = node.id;
          board.users[user.id].focus = node.id;
          board.users[user.id].range = null;
        });

        const expectedDoc = toLooseJSON(userBoardHandler);
        const item = expectedDoc.data.document.items[3];
        item.indent += 1;

        userBoardHandler.change((board) => {
          usecases(user.id, board).indent();
        });

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });

    describe('選択項目子項目がある場合', () => {
      it('選択項目が前項目の子項目最後尾に追加され、選択項目子項目全ても前項目の子項目に追加されていること', () => {
        userBoardHandler.change((doc) => {
          if (doc.document.items[2] === null) return;

          const node = doc.document.items[5]; // Paragraph6

          doc.users[user.id].anchor = node.id;
          doc.users[user.id].focus = node.id;
          doc.users[user.id].range = null;
        });

        const expectedDoc = toLooseJSON(userBoardHandler);
        const items = expectedDoc.data.document.items;
        items[5].indent += 1;

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).indent();
        });

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });
  });
});

describe('アウトデント操作', () => {
  describe('親項目がない場合', () => {
    it('何も変更されないこと', () => {
      const expectedDoc = toLooseJSON(userBoardHandler);

      userBoardHandler.change((doc) => {
        usecases(user.id, doc).outdent();
      });

      assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
    });
  });

  describe('親項目がある場合', () => {
    describe('選択項目次項目がない場合', () => {
      it('選択項目が前項目の子項目最後尾に追加されていること', () => {
        userBoardHandler.change((doc) => {
          if (!doc.document.items) return;

          const node = doc.document.items[3];

          doc.users[user.id].anchor = node.id;
          doc.users[user.id].focus = node.id;
          doc.users[user.id].range = null;
        });

        const expectedDoc = toLooseJSON(userBoardHandler);
        const node = expectedDoc.data.document.items[3];
        node.indent -= 1;

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).outdent();
        });

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });

    describe('選択項目次項目がある場合', () => {
      it('選択項目が前項目の子項目最後尾に追加され、選択項目子項目全ても前項目の子項目に追加されていること', () => {
        userBoardHandler.change((doc) => {
          if (!doc.document.items) return;

          const node = doc.document.items[2];

          doc.users[user.id].anchor = node.id;
          doc.users[user.id].focus = node.id;
          doc.users[user.id].range = null;
        });

        const expectedDoc = toLooseJSON(userBoardHandler);
        const node = expectedDoc.data.document.items[2];
        node.indent -= 1;

        userBoardHandler.change((doc) => {
          usecases(user.id, doc).outdent();
        });

        assert.deepEqual(toLooseJSON(userBoardHandler), expectedDoc);
      });
    });
  });
});
