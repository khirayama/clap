import * as Automerge from 'automerge';
import * as assert from 'power-assert';

import { usecase, Doc } from './usecase';
import { factory } from './factory';
import { CRDTDocument } from './CRDTDocument';

const user = {
  id: Automerge.uuid(),
};
const member = {
  id: Automerge.uuid(),
};
let userDoc: CRDTDocument;
let memberDoc: CRDTDocument;

beforeEach(() => {
  userDoc = new CRDTDocument(user.id);
  memberDoc = new CRDTDocument(member.id, userDoc.save());
  memberDoc.change((doc) => {
    const selection = factory.selection.createSelection();
    doc.users[member.id] = selection;
  });
  userDoc.merge(new CRDTDocument(member.id, memberDoc.save()));
  memberDoc.merge(new CRDTDocument(user.id, userDoc.save()));
});

describe('.insertText()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('「あいうえお」と挿入したとき', () => {
      it('文字列が挿入されて選択範囲位置が文字数分後ろへ移動していること', () => {
        console.log(userDoc.doc);
        userDoc.change((doc) => {
          usecase.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        console.log(userDoc.doc);
      });
      it('文字列が挿入されて共同編集者の選択範囲始点が文字数分後ろへ移動していること', () => {});
      it('文字列が挿入されて共同編集者の選択範囲終点が文字数分後ろへ移動していること', () => {});
    });
  });
});
