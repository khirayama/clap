// factory, transform, traveral
import { Doc } from './interfaces';
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

    if (selection.range !== null) {
      if (sutils.isCollasped(selection)) {
        actions.insertText(userId, doc, chars);
      } else if (selection.range !== null && !sutils.isCollasped(selection)) {
        actions.removeText(userId, doc);
        actions.insertText(userId, doc, chars);
      }
    } else if (selection.range === null) {
      if (selection.ids.length) {
        // TODO: cおよびd
      }
    }
  },
  indent: () => {},
  outdent: () => {},
  remove: (userId: string, doc: Doc) => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    if (selection.range !== null) {
      if (sutils.isCollasped(selection)) {
        const node = traversal.node.findCurrentNode(selection, document);
        if (
          node !== null &&
          node.inline !== null &&
          node.object === 'item' &&
          selection.range.anchor.id === node.inline[0].id &&
          selection.range.anchor.offset.value === 0
        ) {
          // TODO: 編集者選択範囲始点が項目のインライン先頭の先頭だった場合
          if (node.type !== 'paragraph') {
            // TODO: 「Actions 項目タイプを変更する」で段落項目へ変換を適用
          } else if (node.parent !== node.document) {
            // TODO: 「Actions アウトデントする」を適用
          } else if (node.parent === node.document) {
            /* TODO:
        - 上項目がインラインを持つ場合
          - 上項目とインラインとして結合する
        - 上項目がインラインを持たない場合
          - 「Actions 項目を削除する」で上項目を削除を適用
          - 「Actions 項目を削除したときの後処理」を適用
            */
          }
        } else {
          actions.removeChar(userId, doc);
        }
      } else if (!sutils.isCollasped(selection)) {
        actions.removeText(userId, doc);
        actions.postprocessTextDeletion(userId, doc);
      }
    } else if (selection.range === null) {
      if (selection.ids.length) {
        actions.removeItems(userId, doc);
        actions.postprocessItemDeletion(userId, doc);
      }
    }
  },
};
