// factory, transformation, traveral
import { factory } from './factory';
import { transformation } from './transformation';
import { traversal } from './traversal';

import { Board } from './interfaces';
import { actions } from './actions';
import { Selection, utils as sutils } from './selection';
import { getMemberIds, isAnchorUpper } from './actionsutils';

export function init(userId: string): Board {
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

    indent: () => {
      const nodes = traverse.node.findCurrentNodes(selection);

      for (const node of nodes) {
        if (node !== null && node.object === 'item') {
          transform.node.indent(node);
        }
      }
    },

    outdent: () => {
      const nodes = traverse.node.findCurrentNodes(selection);

      for (const node of nodes) {
        if (node !== null && node.object === 'item') {
          transform.node.outdent(node);
        }
      }
    },

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
            if (node.type !== 'paragraph') {
              transform.node.turnInto(node, 'paragraph');
            } else if (node.parent !== node.document) {
              transform.node.outdent(node);
            } else if (node.parent === node.document) {
              const upperNode = traverse.node.findUpperNode(node);

              if (upperNode === null) return;

              if (upperNode.inline !== null) {
                const lastInline = upperNode.inline[upperNode.inline.length - 1];
                const userIds = Object.keys(users);
                for (const uid of userIds) {
                  const slctn = users[uid];
                  // TODO: ここの共同編集者のはどうなるのか再考
                  if (slctn.range !== null && slctn.anchor === node.id && slctn.focus === node.id) {
                    slctn.anchor = upperNode.id;
                    slctn.focus = upperNode.id;
                    slctn.range = factory.selection.createRange(lastInline.id, lastInline.text.length);
                  }
                }

                for (const inln of node.inline) {
                  transform.node.appendInline(upperNode, inln);
                }
                commands.postprocessTextDeletion();
              } else {
                transform.node.remove(upperNode);
                // TODO: selection.anchor/focusを変更した時にrangeも変わるはずでは
                const memberIds = getMemberIds(userId, users);
                for (const mid of memberIds) {
                  const slctn = users[mid];
                  if (slctn.anchor !== null && slctn.focus !== null && slctn.anchor === upperNode.id) {
                    slctn.anchor = isAnchorUpper(document, slctn.anchor, slctn.focus) ? upperNode.next : upperNode.prev;
                  }
                  if (slctn.anchor !== null && slctn.focus !== null && slctn.focus === upperNode.id) {
                    slctn.focus = !isAnchorUpper(document, slctn.anchor, slctn.focus) ? upperNode.next : upperNode.prev;
                  }
                }
                commands.postprocessItemDeletion();
              }
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
