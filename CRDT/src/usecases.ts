// factory, transform, traveral
import { Doc } from './interfaces';
import { factory } from './factory';
import { traversal } from './traversal';
import { actions } from './actions';
import { Selection, utils as sutils } from './selection';
import { transformation } from './transformation';
/*
 * API設計時の注意: 引数を与える場合の優先順位
 * userId > Doc > 個別の引数
 */

export function init(userId: string): Doc {
  const selection = factory.selection.createSelection();
  const document = factory.node.createDocumentNode();
  const paragraph = factory.node.createParagraphNode();
  const inlineText = factory.inline.createInlineText();

  const transform = transformation(document);

  inlineText.parent = paragraph.id;
  paragraph.inline.push(inlineText);
  transform.node.append(document, paragraph);

  selection.anchor = paragraph.id;
  selection.focus = paragraph.id;
  selection.range = factory.selection.createRange(inlineText.id, 0);

  return {
    document,
    users: {
      [userId]: selection,
    },
  };
}

export function usecases(userId: string, doc: Doc) {
  const users = doc.users;
  const document = doc.document;
  const selection: Selection = users[userId];

  const traverse = traversal(document);
  const transform = transformation(document);
  const commands = actions(userId, doc);

  const scenarios = {
    enter: () => {},

    input: (chars: string[]) => {
      if (selection.range !== null) {
        if (sutils.isCollasped(selection)) {
          commands.insertText(chars);
        } else if (selection.range !== null && !sutils.isCollasped(selection)) {
          commands.removeText();
          commands.insertText(chars);
        }
      } else if (selection.range === null) {
        if (selection.anchor !== null && selection.focus !== null && selection.anchor !== selection.focus) {
          commands.replaceItem(chars);
        }
      }
    },

    indent: () => {},

    outdent: () => {},

    remove: () => {
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
            commands.removeChar();
          }
        } else if (!sutils.isCollasped(selection)) {
          commands.removeText();
          commands.postprocessTextDeletion();
        }
      } else if (selection.range === null) {
        if (selection.anchor !== null && selection.focus !== null) {
          commands.removeItems();
          commands.postprocessItemDeletion();
        }
      }
    },
  };

  return scenarios;
}
