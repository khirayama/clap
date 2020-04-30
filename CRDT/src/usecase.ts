import * as Automerge from 'automerge';

import { factory } from './factory';
import { transform } from './transform';
import { traversal } from './traversal';
import { Selection, utils as selectionUtils } from './selection';
import { DocumentNode } from './node';

/*
 * API設計時の注意: 引数を与える場合の優先順位
 * userId > CRDTDocument > 個別の引数
 */

export type Doc = { document: DocumentNode; users: { [userId: string]: Selection } };

export const usecase = {
  init: (userId: string): Doc => {
    const selection = factory.selection.createSelection();
    const document = factory.node.createDocumentNode();
    const paragraph = factory.node.createParagraphNode();
    const inlineText = factory.inline.createInlineText();

    paragraph.inline.push(inlineText);
    transform.node.append(document, paragraph);

    selection.ids.push(paragraph.id);
    selection.range = {
      anchor: {
        id: inlineText.id,
        offset: new Automerge.Counter(0),
      },
      focus: {
        id: inlineText.id,
        offset: new Automerge.Counter(0),
      },
    };

    return {
      document,
      users: {
        [userId]: selection,
      },
    };
  },

  insertText: (userId: string, doc: Doc, chars: string[]): void => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    if (selection.range === null || !selectionUtils.isCollasped(selection)) return;

    const node = traversal.node.findCurrentNode(selection, document);

    if (node === null || node.inline === null) return;

    const inlineId = selection.range.anchor.id;
    const inline = traversal.inline.find(node, inlineId);

    if (inline === null) return;

    const offset = selection.range.anchor.offset.value;
    transform.inline.insert(inline, offset, chars);

    const userIds = Object.keys(users);
    if (selection.range.anchor.id === inlineId && selection.range.anchor.offset.value >= offset) {
      selection.range.anchor.offset.increment(chars.length);
    }
    if (selection.range.focus.id === selection.range.focus.id && selection.range.focus.offset.value >= offset) {
      selection.range.focus.offset.increment(chars.length);
    }
    for (const uid of userIds) {
      const slctn = users[uid];
      if (slctn && slctn.range && slctn.ids[0] === node.id) {
        if (uid !== userId) {
          // 共同編集者への処理
          if (slctn.range.anchor.id === inlineId && slctn.range.anchor.offset.value > offset) {
            slctn.range.anchor.offset.increment(chars.length);
          }
          if (slctn.range.focus.id === inlineId && slctn.range.focus.offset.value > offset) {
            slctn.range.focus.offset.increment(chars.length);
          }
        }
      }
    }
  },
};
