// factory, transform, traveral
import { Doc } from './interfaces';
import { traversal } from './traversal';
import { actions } from './actions';
import { Selection, utils as sutils } from './selection';
import { transformation } from './transformation';
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
      if (selection.anchor !== null && selection.focus !== null && selection.anchor !== selection.focus) {
        actions.replaceItem(userId, doc, chars);
      }
    }
  },
  indent: () => {},
  outdent: () => {},
  remove: (userId: string, doc: Doc) => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    const traverse = traversal(document);
    const transform = transformation(document);

    if (selection.range !== null) {
      if (sutils.isCollasped(selection)) {
        const node = traverse.node.findCurrentNode(selection);
        if (
          node !== null &&
          node.inline !== null &&
          node.object === 'item' &&
          selection.range.anchor.id === node.inline[0].id &&
          selection.range.anchor.offset.value === 0
        ) {
          transform.node.turnInto(node, 'paragraph');
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
      if (selection.anchor !== null && selection.focus !== null) {
        actions.removeItems(userId, doc);
        actions.postprocessItemDeletion(userId, doc);
      }
    }
  },
};
