// factory, transform, traveral
import { Doc } from './interfaces';
import { factory } from './factory';
import { transform } from './transform';
import { traversal } from './traversal';
import { Selection, utils as sutils } from './selection';

import { ItemNode } from './node';

/*
 * API設計時の注意: 引数を与える場合の優先順位
 * userId > CRDTDocument > 個別の引数
 */
function getStartAndEnd(selection: Selection, node: ItemNode) {
  let start = null;
  let end = null;

  if (selection.range === null || node.inline === null) {
    return { start, end };
  }
  const anchor = selection.range.anchor;
  const focus = selection.range.focus;

  if (anchor.id === focus.id) {
    if (anchor.offset.value < focus.offset.value) {
      return {
        start: anchor,
        end: focus,
      };
    } else {
      return {
        start: focus,
        end: anchor,
      };
    }
  }

  for (let i = 0; i < node.inline.length; i += 1) {
    const inline = node.inline[i];

    if (start === null) {
      if (inline.id === anchor.id) {
        start = anchor;
      } else if (inline.id === focus.id) {
        start = focus;
      }
    } else {
      if (inline.id === anchor.id) {
        end = anchor;
      } else if (inline.id === focus.id) {
        end = focus;
      }
    }
  }

  return {
    start,
    end,
  };
}

export const actions = {
  init: (userId: string): Doc => {
    const selection = factory.selection.createSelection();
    const document = factory.node.createDocumentNode();
    const paragraph = factory.node.createParagraphNode();
    const inlineText = factory.inline.createInlineText();

    paragraph.inline.push(inlineText);
    transform.node.append(document, paragraph);

    selection.ids.push(paragraph.id);
    selection.range = factory.selection.createRange(inlineText.id, 0);

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

    if (selection.range === null) return;

    if (sutils.isCollasped(selection)) {
      const node = traversal.node.findCurrentNode(selection, document);

      if (node === null || node.inline === null) return;

      const inlineId = selection.range.anchor.id;
      const inline = traversal.inline.find(node, inlineId);

      if (inline === null) return;

      const offset = selection.range.anchor.offset.value;
      transform.inline.insertText(inline, offset, chars);

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
            if (slctn.range.anchor.id === inlineId && slctn.range.anchor.offset.value > offset) {
              slctn.range.anchor.offset.increment(chars.length);
            }
            if (slctn.range.focus.id === inlineId && slctn.range.focus.offset.value > offset) {
              slctn.range.focus.offset.increment(chars.length);
            }
          }
        }
      }
    } else {
      actions.deleteText(userId, doc);
      actions.insertText(userId, doc, chars);
    }
  },

  deleteText: (userId: string, doc: Doc): void => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    if (selection.range === null) return;

    if (sutils.isCollasped(selection)) {
      const node = traversal.node.findCurrentNode(selection, document);

      if (node === null || node.inline === null) return;

      const inlineId = selection.range.anchor.id;
      const inline = traversal.inline.find(node, inlineId);

      if (inline === null) return;

      const offset = selection.range.anchor.offset.value;
      transform.inline.deleteText(inline, offset - 1, 1);

      const userIds = Object.keys(users);
      if (selection.range.anchor.id === inlineId && selection.range.anchor.offset.value >= offset) {
        selection.range.anchor.offset.decrement(1);
      }
      if (selection.range.focus.id === selection.range.focus.id && selection.range.focus.offset.value >= offset) {
        selection.range.focus.offset.decrement(1);
      }
      for (const uid of userIds) {
        const slctn = users[uid];
        if (slctn && slctn.range && slctn.ids[0] === node.id) {
          if (uid !== userId) {
            if (slctn.range.anchor.id === inlineId && slctn.range.anchor.offset.value > offset) {
              slctn.range.anchor.offset.decrement(1);
            }
            if (slctn.range.focus.id === inlineId && slctn.range.focus.offset.value > offset) {
              slctn.range.focus.offset.decrement(1);
            }
          }
        }
      }
    } else {
      const node = traversal.node.findCurrentNode(selection, document);

      if (node === null || node.inline === null) return;

      const { start, end } = getStartAndEnd(selection, node);

      if (start === null || end === null) return;

      if (start.id === end.id) {
        const startInline = traversal.inline.find(node, start.id);

        if (startInline === null) return;

        for (let i = 0; i < node.inline.length; i += 1) {
          const inline = node.inline[i];

          const startInlineId = start.id;
          const startOffset = start.offset.value;
          const endInlineId = end.id;
          const endOffset = end.offset.value;
          transform.inline.deleteText(inline, startOffset, endOffset - 1);

          const size = endOffset - startOffset;
          const userIds = Object.keys(users);
          if (end.id === endInlineId && end.offset.value >= endOffset) {
            end.offset.decrement(size);
          }
          for (const uid of userIds) {
            const slctn = users[uid];
            if (slctn && slctn.range && slctn.ids[0] === node.id) {
              if (uid !== userId) {
                if (slctn.range.anchor.id === startInlineId && slctn.range.anchor.offset.value > startOffset) {
                  slctn.range.anchor.offset.decrement(size);
                }
                if (slctn.range.focus.id === endInlineId && slctn.range.focus.offset.value > endOffset) {
                  slctn.range.focus.offset.decrement(size);
                }
              }
            }
          }
        }
      } else {
        let isStarted = false;
        const removedIds: string[] = [];

        for (let i = 0; i < node.inline.length; i += 1) {
          const inline = node.inline[i];

          if (inline.id === start.id) {
            isStarted = true;
            const startInline = traversal.inline.find(node, start.id);
            if (startInline) {
              transform.inline.deleteText(inline, start.offset.value, startInline.text.length - start.offset.value);
            }
          } else if (inline.id === end.id) {
            isStarted = false;
            const endInline = traversal.inline.find(node, end.id);
            if (endInline) {
              transform.inline.deleteText(inline, 0, end.offset.value);
            }
          } else if (isStarted) {
            removedIds.push(inline.id);
            transform.node.removeInline(node, inline);
            i -= 1;
          }
        }

        // Selections
        const startId = start.id;
        const startOffset = start.offset.value;
        const endId = end.id;
        const endOffset = end.offset.value;

        end.id = start.id;
        end.offset.increment(sutils.getOffset(endOffset, startOffset));

        const userIds = Object.keys(users);
        for (const uid of userIds) {
          if (uid !== userId) {
            const slctn = users[uid];

            if (slctn && slctn.range && slctn.ids[0] === node.id) {
              const tmp = getStartAndEnd(slctn, node);
              const collaboratorStart = tmp.start;
              const collaboratorEnd = tmp.end;

              if (collaboratorStart && collaboratorEnd) {
                // For start
                if (
                  (collaboratorStart.id === startId && collaboratorStart.offset.value > startOffset) ||
                  removedIds.includes(collaboratorStart.id)
                ) {
                  collaboratorStart.id = startId;
                  collaboratorStart.offset.increment(sutils.getOffset(collaboratorStart.offset.value, startOffset));
                }
                // For end
                if (removedIds.includes(collaboratorEnd.id)) {
                  collaboratorEnd.id = startId;
                  collaboratorEnd.offset.increment(sutils.getOffset(collaboratorEnd.offset.value, startOffset));
                } else if (collaboratorEnd.id === endId && collaboratorEnd.offset.value > endOffset) {
                  collaboratorEnd.offset.decrement(endOffset);
                }
              }
            }
          }
        }
      }
    }
  },
};
