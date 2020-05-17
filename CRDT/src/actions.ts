// factory, transform, traveral
import { Doc } from './interfaces';
import { factory } from './factory';
import { transformation } from './transformation';
import { traversal } from './traversal';
import { Selection, utils as sutils } from './selection';
import { getStartAndEnd, hasSameMarks, getMemberIds, isAnchorUpper } from './actionsutils';

/*
 * API設計時の注意: 引数を与える場合の優先順位
 * userId > Doc > 個別の引数
 */

export function actions(userId: string, doc: Doc) {
  const users = doc.users;
  const document = doc.document;
  const selection: Selection = users[userId];

  const traverse = traversal(document);
  const transform = transformation(document);

  const commands = {
    insertText: (chars: string[]): void => {
      if (selection.range === null) return;

      const node = traverse.node.findCurrentNode(selection);

      if (node === null || node.inline === null) return;

      const inlineId = selection.range.anchor.id;
      const inline = traverse.inline.find(node, inlineId);

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
        if (slctn && slctn.range && slctn.anchor === node.id) {
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

    removeChar: (): void => {
      if (selection.range === null) return;

      const node = traverse.node.findCurrentNode(selection);

      if (node === null || node.inline === null) return;

      const inlineId = selection.range.anchor.id;
      const inline = traverse.inline.find(node, inlineId);

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
        if (slctn && slctn.range && slctn.anchor === node.id) {
          if (slctn.range.anchor.id === inlineId && slctn.range.anchor.offset.value >= offset) {
            slctn.range.anchor.offset.decrement(1);
          }
          if (slctn.range.focus.id === inlineId && slctn.range.focus.offset.value >= offset) {
            slctn.range.focus.offset.decrement(1);
          }
        }
      }
    },

    removeText: (): void => {
      const node = traverse.node.findCurrentNode(selection);

      if (node === null || node.inline === null) return;

      const { start, end } = getStartAndEnd(selection, node);

      if (start === null || end === null) return;

      if (start.id === end.id) {
        const startInline = traverse.inline.find(node, start.id);

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
            if (slctn && slctn.range && slctn.anchor === node.id) {
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

        const tmpNode = {
          ...node,
          inline: [...node.inline],
        };

        for (let i = 0; i < node.inline.length; i += 1) {
          const inline = node.inline[i];

          if (inline.id === startId) {
            isStarted = true;
            const startInline = traverse.inline.find(node, startId);
            if (startInline) {
              transform.inline.removeText(inline, startOffset, startInline.text.length - startOffset);
            }
          } else if (inline.id === endId) {
            isStarted = false;
            const endInline = traverse.inline.find(node, endId);
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

          if (slctn && slctn.range && slctn.anchor === node.id) {
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
              } else if (slctn.range.anchor.id === endId && slctn.range.anchor.offset.value > endOffset) {
                slctn.range.anchor.offset.decrement(endOffset);
                slctn.range.focus.offset.decrement(endOffset);
              }
            } else {
              const tmp = getStartAndEnd(slctn, tmpNode);
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

    postprocessTextDeletion: (): void => {
      const node = traverse.node.findCurrentNode(selection);

      if (node === null || node.inline === null) return;

      const tmpNode = { ...node, inline: [...node.inline] };

      // インラインが同様の装飾が並んだ場合
      for (let i = 0; i < node.inline.length; i += 1) {
        const inln = node.inline[i];
        const nextInln = node.inline[i + 1] || null;

        if (nextInln && inln.type === nextInln.type && hasSameMarks(inln.marks, nextInln.marks)) {
          inln.text.splice(inln.text.length, 0, ...nextInln.text);
          node.inline.splice(i + 1, 1);
          i -= 1;

          const userIds = Object.keys(users);
          for (const uid of userIds) {
            const slctn = users[uid];
            const { start, end } = getStartAndEnd(slctn, tmpNode);
            if (start !== null && end !== null) {
              if (start.id === nextInln.id) {
                start.id = inln.id;
                start.offset.increment(start.offset.value);
              }
              if (end.id === nextInln.id) {
                end.id = inln.id;
                end.offset.increment(end.offset.value);
              }
            }
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
            const { start, end } = getStartAndEnd(slctn, tmpNode);

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

    removeItems: (): void => {
      if (selection.range !== null) return;

      const nodes = traverse.node.findCurrentNodes(selection);

      for (const node of nodes) {
        if (node !== null && node.object === 'item') {
          if (node.next) {
            selection.anchor = node.next;
            selection.focus = node.next;
          } else if (node.prev) {
            selection.anchor = node.prev;
            selection.focus = node.prev;
          } else if (node.parent && node.parent !== node.document) {
            selection.anchor = node.parent;
            selection.focus = node.parent;
          } else {
            selection.anchor = null;
            selection.focus = null;
          }

          const mids = getMemberIds(userId, doc.users);
          for (const mid of mids) {
            const slctn = doc.users[mid];
            if (
              slctn.anchor !== null &&
              slctn.focus !== null &&
              (slctn.anchor === node.id || slctn.focus === node.id)
            ) {
              slctn.range = null;

              if (slctn.anchor === slctn.focus) {
                if (node.next) {
                  slctn.anchor = node.next;
                  slctn.focus = node.next;
                } else if (node.prev) {
                  slctn.anchor = node.prev;
                  slctn.focus = node.prev;
                } else if (node.parent && node.parent !== node.document) {
                  slctn.anchor = node.parent;
                  slctn.focus = node.parent;
                } else {
                  slctn.anchor = null;
                  slctn.focus = null;
                }
              } else if (slctn.anchor === node.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (node.next) {
                    slctn.anchor = node.next;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (node.prev) {
                    slctn.anchor = node.prev;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              } else if (slctn.focus === node.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (node.prev) {
                    slctn.focus = node.prev;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (node.next) {
                    slctn.focus = node.next;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              }
            }
          }

          transform.node.remove(node);
        }
      }
    },

    replaceItem: (chars: string[]): void => {
      if (selection.range !== null) return;

      const nodes = traverse.node.findCurrentNodes(selection);

      for (let i = 1; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node !== null && node.object === 'item') {
          const memberIds = getMemberIds(userId, users);
          for (const mid of memberIds) {
            const slctn = users[mid];

            if (
              slctn.anchor !== null &&
              slctn.focus !== null &&
              (slctn.anchor === node.id || slctn.focus === node.id)
            ) {
              slctn.range = null;

              if (slctn.anchor === slctn.focus) {
                if (node.prev) {
                  slctn.anchor = node.prev;
                  slctn.focus = node.prev;
                } else if (node.next) {
                  slctn.anchor = node.next;
                  slctn.focus = node.next;
                } else if (node.parent && node.parent !== node.document) {
                  slctn.anchor = node.parent;
                  slctn.focus = node.parent;
                } else {
                  slctn.anchor = null;
                  slctn.focus = null;
                }
              } else if (slctn.anchor === node.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (node.prev) {
                    slctn.anchor = node.prev;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (node.prev) {
                    slctn.anchor = node.prev;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              } else if (slctn.focus === node.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (node.prev) {
                    slctn.focus = node.prev;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (node.prev) {
                    slctn.focus = node.prev;
                  } else if (node.parent && node.parent !== node.document) {
                    slctn.anchor = node.parent;
                    slctn.focus = node.parent;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              }
            }
          }

          transform.node.remove(node);
        }
      }

      const node = nodes[0];

      if (node === null || node.object !== 'item') return;

      transform.node.turnInto(node, 'paragraph');

      if (node.type !== 'paragraph') return;

      node.inline.splice(0, node.inline.length);
      transform.node.appendInline(node, factory.inline.createInlineText());

      selection.anchor = node.id;
      selection.focus = node.id;
      selection.range = factory.selection.createRange(node.inline[0].id, 0);

      commands.insertText(chars);
    },

    postprocessItemDeletion: (): void => {
      // TODO: 「Actions 項目を削除したときの後処理」を適用
      let todo = false;
      if (todo) {
        console.log(userId, doc);
      }
    },
  };

  return commands;
}
