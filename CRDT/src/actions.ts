// factory, transform, traveral
import { Doc } from './interfaces';
import { factory } from './factory';
import { transform } from './transform';
import { traversal } from './traversal';
import { Selection, utils as sutils } from './selection';
import { getStartAndEnd, hasSameMarks, getMemberIds } from './actionsutils';

/*
 * API設計時の注意: 引数を与える場合の優先順位
 * userId > CRDTDocument > 個別の引数
 */

export const actions = {
  init: (userId: string): Doc => {
    const selection = factory.selection.createSelection();
    const document = factory.node.createDocumentNode();
    const paragraph = factory.node.createParagraphNode();
    const inlineText = factory.inline.createInlineText();

    inlineText.parent = paragraph.id;
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
  },

  removeChar: (userId: string, doc: Doc): void => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    if (selection.range === null) return;

    const node = traversal.node.findCurrentNode(selection, document);

    if (node === null || node.inline === null) return;

    const inlineId = selection.range.anchor.id;
    const inline = traversal.inline.find(node, inlineId);

    if (inline === null) return;

    const offset = selection.range.anchor.offset.value;
    transform.inline.removeText(inline, offset - 1, 1);

    const memberIds = getMemberIds(userId, users);
    if (selection.range.anchor.id === inlineId && selection.range.anchor.offset.value >= offset) {
      selection.range.anchor.offset.decrement(1);
    }
    if (selection.range.focus.id === selection.range.focus.id && selection.range.focus.offset.value >= offset) {
      selection.range.focus.offset.decrement(1);
    }
    for (const mid of memberIds) {
      const slctn = users[mid];
      if (slctn && slctn.range && slctn.ids[0] === node.id) {
        if (slctn.range.anchor.id === inlineId && slctn.range.anchor.offset.value >= offset) {
          slctn.range.anchor.offset.decrement(1);
        }
        if (slctn.range.focus.id === inlineId && slctn.range.focus.offset.value >= offset) {
          slctn.range.focus.offset.decrement(1);
        }
      }
    }
  },

  removeText: (userId: string, doc: Doc): void => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

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
        transform.inline.removeText(inline, startOffset, endOffset - startOffset);

        const size = endOffset - startOffset;
        const memberIds = getMemberIds(userId, users);

        if (end.id === endInlineId && end.offset.value >= endOffset) {
          end.offset.decrement(size);
        }

        for (const mid of memberIds) {
          const slctn = users[mid];
          if (slctn && slctn.range && slctn.ids[0] === node.id) {
            const member = getStartAndEnd(slctn, node);

            if (member.start === null || member.end === null) break;

            if (member.start.id === startInlineId && member.start.offset.value > startOffset) {
              member.start.offset.increment(
                sutils.getOffset(
                  member.start.offset.value,
                  Math.max(member.start.offset.value - size, start.offset.value),
                ),
              );
            }
            if (member.end.id === endInlineId && member.end.offset.value >= startOffset) {
              member.end.offset.increment(
                sutils.getOffset(member.end.offset.value, Math.max(member.end.offset.value - size, end.offset.value)),
              );
            }
          }
        }
      }
    } else {
      let isStarted = false;
      const removedIds: string[] = [];

      const startId = start.id;
      const startOffset = start.offset.value;
      const endId = end.id;
      const endOffset = end.offset.value;

      for (let i = 0; i < node.inline.length; i += 1) {
        const inline = node.inline[i];

        if (inline.id === startId) {
          isStarted = true;
          const startInline = traversal.inline.find(node, startId);
          if (startInline) {
            transform.inline.removeText(inline, startOffset, startInline.text.length - startOffset);
          }
        } else if (inline.id === endId) {
          isStarted = false;
          const endInline = traversal.inline.find(node, endId);
          if (endInline) {
            transform.inline.removeText(inline, 0, endOffset);
          }
        } else if (isStarted) {
          removedIds.push(inline.id);
          transform.inline.remove(node, inline);
          i -= 1;
        }
      }

      end.id = start.id;
      end.offset.increment(sutils.getOffset(endOffset, startOffset));

      const memberIds = getMemberIds(userId, users);
      for (const mid of memberIds) {
        const slctn = users[mid];

        if (slctn && slctn.range && slctn.ids[0] === node.id) {
          if (sutils.isCollasped(slctn)) {
            if (
              (slctn.range.anchor.id === startId && slctn.range.anchor.offset.value > startOffset) ||
              (slctn.range.anchor.id === endId && slctn.range.anchor.offset.value <= endOffset) ||
              removedIds.includes(slctn.range.anchor.id)
            ) {
              slctn.range.anchor.id = startId;
              slctn.range.anchor.offset.increment(sutils.getOffset(slctn.range.anchor.offset.value, startOffset));
              slctn.range.focus.id = startId;
              slctn.range.focus.offset.increment(sutils.getOffset(slctn.range.focus.offset.value, startOffset));
            }
          } else {
            const tmp = getStartAndEnd(slctn, node);
            const collaboratorStart = tmp.start;
            const collaboratorEnd = tmp.end;

            if (collaboratorStart !== null && collaboratorEnd !== null) {
              if (
                (collaboratorStart.id === startId && collaboratorStart.offset.value > startOffset) ||
                removedIds.includes(collaboratorStart.id)
              ) {
                collaboratorStart.id = startId;
                collaboratorStart.offset.increment(sutils.getOffset(collaboratorStart.offset.value, startOffset));
              }

              if (
                removedIds.includes(collaboratorEnd.id) ||
                (collaboratorEnd.id === startId && collaboratorEnd.offset.value > startOffset) ||
                (collaboratorEnd.id === endId && collaboratorEnd.offset.value <= endOffset)
              ) {
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
  },

  postprocessTextDeletion: (userId: string, doc: Doc): void => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    const node = traversal.node.findCurrentNode(selection, document);

    if (node === null || node.inline === null) return;

    // インラインが同様の装飾が並んだ場合
    for (let i = 0; i < node.inline.length; i += 1) {
      const inln = node.inline[i];
      const nextInln = node.inline[i + 1] || null;

      if (nextInln && inln.type === nextInln.type && hasSameMarks(inln.marks, nextInln.marks)) {
        inln.text.splice(inln.text.length, 0, ...nextInln.text);
        node.inline.splice(i + 1, 1);

        i -= 1;

        const { start, end } = getStartAndEnd(selection, node);
        if (start !== null && end !== null && start.id !== end.id) {
          end.id = start.id;
          end.offset.increment(start.offset.value);
        }
      }
    }

    // インラインのテキストが空になった場合
    for (let i = 0; i < node.inline.length; i += 1) {
      const prevInln = node.inline[i - 1] || null;
      const inln = node.inline[i];
      const nextInln = node.inline[i + 1] || null;

      if (inln.text.length === 0) {
        const userIds = Object.keys(users);
        for (const uid of userIds) {
          const slctn = users[uid];
          const { start, end } = getStartAndEnd(slctn, node);

          if (prevInln !== null) {
            if (start !== null && end !== null && start.id === inln.id) {
              start.id = prevInln.id;
              start.offset.increment(sutils.getOffset(start.offset.value, prevInln.text.length));
            }
            if (start !== null && end !== null && end.id === inln.id) {
              end.id = prevInln.id;
              end.offset.increment(sutils.getOffset(end.offset.value, prevInln.text.length));
            }
          } else if (nextInln !== null) {
            if (start !== null && end !== null && start.id === inln.id) {
              start.id = nextInln.id;
              start.offset.increment(sutils.getOffset(start.offset.value, 0));
            }
            if (start !== null && end !== null && end.id === inln.id) {
              end.id = nextInln.id;
              end.offset.increment(sutils.getOffset(end.offset.value, 0));
            }
          }
        }
        node.inline.splice(i, 1);
        i -= 1;
      }
    }
  },

  removeItems: (userId: string, doc: Doc): void => {
    const users = doc.users;
    const document = doc.document;
    const selection: Selection = users[userId];

    if (selection.range !== null) return;

    const nodes = traversal.node.findCurrentNodes(selection, document);

    for (const node of nodes) {
      if (node !== null && node.object === 'item') {
        transform.node.remove(document, node);

        if (node.next) {
          selection.ids = [node.next];
        } else if (node.prev) {
          selection.ids = [node.prev];
        } else if (node.parent && node.parent !== node.document) {
          selection.ids = [node.parent];
        } else {
          selection.ids = [];
        }

        const mids = getMemberIds(userId, doc.users);
        for (const mid of mids) {
          const slctn = doc.users[mid];
          if (slctn.ids.length === 1 && slctn.ids[0] === node.id) {
            slctn.range = null;
            if (node.next) {
              slctn.ids = [node.next];
            } else if (node.prev) {
              slctn.ids = [node.prev];
            } else if (node.parent && node.parent !== node.document) {
              slctn.ids = [node.parent];
            } else {
              slctn.ids = [];
            }
          } else if (slctn.ids.includes(node.id)) {
            slctn.ids = slctn.ids.filter((nid) => nid !== node.id);
          }
        }
      }
    }
  },

  postprocessItemDeletion: (userId: string, doc: Doc): void => {
    // TODO: 「Actions 項目を削除したときの後処理」を適用
    let todo = false;
    if (todo) {
      console.log(userId, doc);
    }
  },
};
