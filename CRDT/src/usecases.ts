// factory, transform, traveral
import { Doc } from './interfaces';
import { factory } from './factory';
import { transform } from './transform';
import { traversal } from './traversal';
import { actions } from './actions';
import { Selection, utils as sutils } from './selection';
/*
 * API設計時の注意: 引数を与える場合の優先順位
 * userId > CRDTDocument > 個別の引数
 */

export const usecases = {
  enter: () => {},
  input: (userId: string, doc: Doc, chars: string[]) => {
    const users = doc.users;
    const selection: Selection = users[userId];

    if (selection.range !== null && sutils.isCollasped(selection)) {
      actions.insertText(userId, doc, chars);
    } else if (selection.range !== null && !sutils.isCollasped(selection)) {
      actions.removeText(userId, doc);
      actions.insertText(userId, doc, chars);
    } else if (selection.range === null && selection.ids.length) {
      // TODO: cおよびd
    }
  },
  indent: () => {},
  outdent: () => {},
  remove: (userId: string, doc: Doc) => {
    const users = doc.users;
    const selection: Selection = users[userId];

    if (selection.range !== null && sutils.isCollasped(selection)) {
      // TODO: 編集者選択範囲始点が項目のインライン先頭の先頭だった場合
      actions.removeChar(userId, doc);
    } else if (selection.range !== null && !sutils.isCollasped(selection)) {
      actions.removeText(userId, doc);
      // TODO: 「Actions 文字を削除した場合の後処理」を適用する
    } else if (selection.range === null && selection.ids.length) {
      actions.removeItems(userId, doc);
      // TODO: 「Actions 項目を削除したときの後処理」を適用
    }
  },
};
