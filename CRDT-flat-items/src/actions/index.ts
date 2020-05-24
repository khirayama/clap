// factory, transformation, traveral
import { factory } from '../factory';
import { transformation } from '../transformation';
import { traversal } from '../traversal';

import { Board, Selection, utils as sutils } from '../structures';
import { getStartAndEnd, hasSameMarks, getMemberIds, isAnchorUpper } from './utils';

export function actions(userId: string, board: Board) {
  const users = board.users;
  const document = board.document;
  const selection: Selection = users[userId];

  const traverse = traversal(document);
  const transform = transformation(document);

  const commands = {
    insertText: (chars: string[]): void => {
      if (selection.range === null) return;

      const item = traverse.item.findCurrentItem(selection);

      if (item === null || item.inline === null) return;

      const inlineId = selection.range.anchor.id;
      const inline = traverse.inline.find(inlineId, item.id);

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
        if (slctn && slctn.range && slctn.anchor === item.id) {
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

      const item = traverse.item.findCurrentItem(selection);

      if (item === null || item.inline === null) return;

      const inlineId = selection.range.anchor.id;
      const inline = traverse.inline.find(inlineId, item.id);

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
        if (slctn && slctn.range && slctn.anchor === item.id) {
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
      const item = traverse.item.findCurrentItem(selection);

      if (item === null || item.inline === null) return;

      const { start, end } = getStartAndEnd(selection, item);

      if (start === null || end === null) return;

      if (start.id === end.id) {
        const startInline = traverse.inline.find(start.id, item.id);

        if (startInline === null) return;

        for (let i = 0; i < item.inline.length; i += 1) {
          const inline = item.inline[i];

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
            if (slctn && slctn.range && slctn.anchor === item.id) {
              const member = getStartAndEnd(slctn, item);

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

        const tmpItem = {
          ...item,
          inline: [...item.inline],
        };

        for (let i = 0; i < item.inline.length; i += 1) {
          const inline = item.inline[i];

          if (inline.id === startId) {
            isStarted = true;
            const startInline = traverse.inline.find(startId, item.id);
            if (startInline) {
              transform.inline.removeText(inline, startOffset, startInline.text.length - startOffset);
            }
          } else if (inline.id === endId) {
            isStarted = false;
            const endInline = traverse.inline.find(endId, item.id);
            if (endInline) {
              transform.inline.removeText(inline, 0, endOffset);
            }
          } else if (isStarted) {
            removedIds.push(inline.id);
            transform.inline.remove(item, inline);
            i -= 1;
          }
        }

        end.id = start.id;
        end.offset.increment(sutils.getOffset(endOffset, startOffset));

        const memberIds = getMemberIds(userId, users);
        for (const mid of memberIds) {
          const slctn = users[mid];

          if (slctn && slctn.range && slctn.anchor === item.id) {
            if (sutils.selection.isCollasped(slctn)) {
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
              const tmp = getStartAndEnd(slctn, tmpItem);
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
      const item = traverse.item.findCurrentItem(selection);

      if (item === null || item.inline === null) return;

      const tmpNode = { ...item, inline: [...item.inline] };

      // インラインが同様の装飾が並んだ場合
      for (let i = 0; i < item.inline.length; i += 1) {
        const inln = item.inline[i];
        const nextInln = item.inline[i + 1] || null;

        if (nextInln && inln.type === nextInln.type && hasSameMarks(inln.marks, nextInln.marks)) {
          inln.text.splice(inln.text.length, 0, ...nextInln.text);
          item.inline.splice(i + 1, 1);
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
      for (let i = 0; i < item.inline.length; i += 1) {
        const prevInln = item.inline[i - 1] || null;
        const inln = item.inline[i];
        const nextInln = item.inline[i + 1] || null;

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

          item.inline.splice(i, 1);
          i -= 1;
        }
      }
    },

    removeItems: (): void => {
      if (selection.range !== null) return;

      const items = traverse.item.findCurrentItems(selection);

      for (const item of items) {
        const index = sutils.item.getIndex(document, item.id);
        const prevItem = document.items[index - 1] || null;
        const nextItem = document.items[index + 1] || null;

        if (item !== null) {
          if (nextItem !== null) {
            selection.anchor = nextItem.id;
            selection.focus = nextItem.id;
          } else if (document.items[index - 1]) {
            selection.anchor = prevItem.id;
            selection.focus = prevItem.id;
          } else {
            selection.anchor = null;
            selection.focus = null;
          }

          const mids = getMemberIds(userId, users);
          for (const mid of mids) {
            const slctn = users[mid];
            if (
              slctn.anchor !== null &&
              slctn.focus !== null &&
              (slctn.anchor === item.id || slctn.focus === item.id)
            ) {
              slctn.range = null;

              if (slctn.anchor === slctn.focus) {
                if (nextItem) {
                  slctn.anchor = nextItem.id;
                  slctn.focus = nextItem.id;
                } else if (prevItem) {
                  slctn.anchor = prevItem.id;
                  slctn.focus = prevItem.id;
                } else {
                  slctn.anchor = null;
                  slctn.focus = null;
                }
              } else if (slctn.anchor === item.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (nextItem) {
                    slctn.anchor = nextItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (prevItem) {
                    slctn.anchor = prevItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              } else if (slctn.focus === item.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (prevItem) {
                    slctn.focus = prevItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (nextItem) {
                    slctn.focus = nextItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              }
            }
          }

          transform.item.remove(item);
        }
      }
    },

    replaceItem: (chars: string[]): void => {
      if (selection.range !== null) return;

      const items = traverse.item.findCurrentItems(selection);

      for (let i = 1; i < items.length; i += 1) {
        const item = items[i];
        if (item !== null) {
          const memberIds = getMemberIds(userId, users);

          const index = sutils.item.getIndex(document, item.id);
          const prevItem = document.items[index - 1] || null;
          const nextItem = document.items[index + 1] || null;

          for (const mid of memberIds) {
            const slctn = users[mid];

            if (
              slctn.anchor !== null &&
              slctn.focus !== null &&
              (slctn.anchor === item.id || slctn.focus === item.id)
            ) {
              slctn.range = null;

              if (slctn.anchor === slctn.focus) {
                if (prevItem !== null) {
                  slctn.anchor = prevItem.id;
                  slctn.focus = prevItem.id;
                } else if (nextItem !== null) {
                  slctn.anchor = nextItem.id;
                  slctn.focus = nextItem.id;
                } else {
                  slctn.anchor = null;
                  slctn.focus = null;
                }
              } else if (slctn.anchor === item.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (prevItem !== null) {
                    slctn.anchor = prevItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (prevItem !== null) {
                    slctn.anchor = prevItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              } else if (slctn.focus === item.id) {
                if (isAnchorUpper(document, slctn.anchor, slctn.focus)) {
                  if (prevItem !== null) {
                    slctn.focus = prevItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                } else {
                  if (prevItem !== null) {
                    slctn.focus = prevItem.id;
                  } else {
                    slctn.anchor = null;
                    slctn.focus = null;
                  }
                }
              }
            }
          }

          transform.item.remove(item);
        }
      }

      const item = items[0];

      if (item === null) return;

      transform.item.turnInto(item, 'paragraph');

      if (item.type !== 'paragraph') return;

      item.inline.splice(0, item.inline.length);
      transform.item.appendInline(item, factory.inline.createInlineText());

      selection.anchor = item.id;
      selection.focus = item.id;
      selection.range = factory.range.create(item.inline[0].id, 0);

      commands.insertText(chars);
    },

    postprocessItemDeletion: (): void => {
      // TODO: 「Actions 項目を削除したときの後処理」を適用
      let todo = false;
      if (todo) {
        console.log(userId, board);
      }
    },
  };

  return commands;
}
