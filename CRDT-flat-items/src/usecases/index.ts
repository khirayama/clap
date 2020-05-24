// factory, transformation, traveral
import { factory } from '../factory';
import { transformation } from '../transformation';
import { traversal } from '../traversal';

import { actions } from '../actions';
import { getMemberIds, isAnchorUpper } from '../actions/utils';
import { Board, Selection, utils as sutils } from '../structures';

export function init(userId: string): Board {
  const selection = factory.selection.create();
  const document = factory.document.create();
  const paragraph = factory.item.createParagraph();
  const inlineText = factory.inline.createInlineText();

  const transform = transformation(document);

  inlineText.parent = paragraph.id;
  paragraph.inline.push(inlineText);
  transform.item.append(paragraph);

  selection.anchor = paragraph.id;
  selection.focus = paragraph.id;
  selection.range = factory.range.create(inlineText.id, 0);

  return {
    document,
    users: {
      [userId]: selection,
    },
  };
}

export function usecases(userId: string, board: Board) {
  const users = board.users;
  const document = board.document;
  const selection: Selection = users[userId];

  const traverse = traversal(document);
  const transform = transformation(document);
  const commands = actions(userId, board);

  const scenarios = {
    enter: () => {},

    input: (chars: string[]) => {
      if (selection.range !== null) {
        if (sutils.selection.isCollasped(selection)) {
          commands.insertText(chars);
        } else if (selection.range !== null && !sutils.selection.isCollasped(selection)) {
          commands.removeText();
          commands.insertText(chars);
        }
      } else if (selection.range === null) {
        if (selection.anchor !== null && selection.focus !== null && selection.anchor !== selection.focus) {
          commands.replaceItem(chars);
        }
      }
    },

    indent: () => {
      const items = traverse.item.findCurrentItems(selection);

      for (const item of items) {
        if (item !== null) {
          transform.item.indent(item);
        }
      }
    },

    outdent: () => {
      const items = traverse.item.findCurrentItems(selection);

      for (const item of items) {
        if (item !== null) {
          transform.item.outdent(item);
        }
      }
    },

    remove: () => {
      if (selection.range !== null) {
        if (sutils.selection.isCollasped(selection)) {
          const item = traverse.item.findCurrentItem(selection);
          if (
            item !== null &&
            item.inline !== null &&
            selection.range.anchor.id === item.inline[0].id &&
            selection.range.anchor.offset.value === 0
          ) {
            if (item.type !== 'paragraph') {
              transform.item.turnInto(item, 'paragraph');
            } else if (item.indent.value > 0) {
              transform.item.outdent(item);
            } else if (item.indent.value === 0) {
              const index = sutils.item.getIndex(document, item.id);
              const prevItem = document.items[index - 1] || null;

              if (prevItem === null) return;

              if (prevItem.inline !== null) {
                const lastInline = prevItem.inline[prevItem.inline.length - 1];
                const userIds = Object.keys(users);
                for (const uid of userIds) {
                  const slctn = users[uid];
                  // TODO: ここの共同編集者のはどうなるのか再考
                  if (slctn.range !== null && slctn.anchor === item.id && slctn.focus === item.id) {
                    slctn.anchor = prevItem.id;
                    slctn.focus = prevItem.id;
                    slctn.range = factory.range.create(lastInline.id, lastInline.text.length);
                  }
                }

                for (const inln of item.inline) {
                  transform.item.appendInline(prevItem, inln);
                }
                commands.postprocessTextDeletion();
              } else {
                const index = sutils.item.getIndex(document, item.id);
                const prevItem = document.items[index - 1] || null;
                const nextItem = document.items[index + 1] || null;

                // TODO: selection.anchor/focusを変更した時にrangeも変わるはずでは
                const memberIds = getMemberIds(userId, users);
                for (const mid of memberIds) {
                  const slctn = users[mid];
                  if (slctn.anchor !== null && slctn.focus !== null && slctn.anchor === prevItem.id) {
                    // TODO: ここの修正怪しい
                    slctn.anchor = isAnchorUpper(document, slctn.anchor, slctn.focus) ? nextItem.id : prevItem.id;
                  }
                  if (slctn.anchor !== null && slctn.focus !== null && slctn.focus === prevItem.id) {
                    // TODO: ここの修正怪しい
                    slctn.focus = !isAnchorUpper(document, slctn.anchor, slctn.focus) ? nextItem.id : prevItem.id;
                  }
                }
                transform.item.remove(prevItem);
                commands.postprocessItemDeletion();
              }
            }
          } else {
            commands.removeChar();
          }
        } else if (!sutils.selection.isCollasped(selection)) {
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
