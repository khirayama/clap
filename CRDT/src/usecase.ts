import * as Automerge from 'automerge';

import { factory } from './factory';
import { transform } from './transform';
import { traversal } from './traversal';
import { Selection, utils as selectionUtils } from './selection';
import { DocumentNode } from './node';

export const usecase = {
  init: (userId: string): { document: DocumentNode; users: { [userId: string]: Selection } } => {
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

  insertText: (
    userId: string,
    users: { [userId: string]: Selection },
    document: DocumentNode,
    chars: string[],
  ): void => {
    const selection: Selection = users[userId];

    if (selection.range === null || !selectionUtils.isCollasped(selection)) return;

    const node = traversal.node.findCurrentNode(selection, document);

    if (node === null || node.inline === null) return;

    const inline = traversal.inline.find(node, selection.range.anchor.id);

    if (inline === null) return;

    const positionToInsert = selection.range.anchor.offset.value;
    transform.inline.insert(inline, positionToInsert, chars);

    const userIds = Object.keys(users);
    const selectionSnapshot = JSON.parse(JSON.stringify(selection));
    for (const uid of userIds) {
      const slctn = users[uid];
      if (slctn && slctn.range && selectionUtils.isCollasped(slctn) && slctn.ids[0] === node.id) {
        if (uid === userId) {
          // 編集者に対しての処理
          if (
            slctn.range.anchor.id === selectionSnapshot.range.anchor.id &&
            slctn.range.anchor.offset.value >= positionToInsert
          ) {
            slctn.range.anchor.offset.increment(chars.length);
          }
          if (
            slctn.range.focus.id === selectionSnapshot.range.focus.id &&
            slctn.range.focus.offset.value >= positionToInsert
          ) {
            slctn.range.focus.offset.increment(chars.length);
          }
        } else {
          // 共同編集者への処理
          if (
            slctn.range.anchor.id === selectionSnapshot.range.anchor.id &&
            slctn.range.anchor.offset.value > positionToInsert
          ) {
            slctn.range.anchor.offset.increment(chars.length);
          }
          if (
            slctn.range.focus.id === selectionSnapshot.range.anchor.id &&
            slctn.range.focus.offset.value > positionToInsert
          ) {
            slctn.range.focus.offset.increment(chars.length);
          }
        }
      }
    }
  },
};
