import { DocumentNode, ItemNode, Inline } from './node';
import { Selection, utils } from './selection';
import { traversal } from './traversal';

export const transform = {
  // Transform node itself primitively
  node: {
    // after, before, remove
    // Add node to the last
    append: (parentNode: DocumentNode | ItemNode, node: ItemNode): void => {
      if (parentNode.nodes) {
        const prevNode = parentNode.nodes[parentNode.nodes.length - 1];

        node.document = parentNode.document;
        node.parent = parentNode.id;
        if (prevNode) {
          prevNode.next = node.id;
          node.prev = prevNode ? prevNode.id : null;
        }
        parentNode.nodes.push(node);
      }
    },
  },
  // Transform inline itself primitively
  inline: {
    insert: (inline: Inline, index: number, chars: string[]) => {
      inline.text.splice(index, 0, ...chars);
    },
  },
  // Transform using userId, Selection and Node
  util: {
    insertText: (
      userId: string,
      users: { [userId: string]: Selection },
      document: DocumentNode,
      chars: string[],
    ): void => {
      const selection: Selection = users[userId];

      if (selection.range === null || !utils.isCollasped(selection)) return;

      const node = traversal.node.findCurrentNode(selection, document);

      if (node === null || node.inline === null) return;

      const inline = traversal.inline.find(node, selection.range.anchor.id);

      if (inline === null) return;

      transform.inline.insert(inline, selection.range.anchor.offset.value, chars);

      const userIds = Object.keys(users);
      const selectionSnapshot = JSON.parse(JSON.stringify(selection));
      for (const uid of userIds) {
        const slctn = users[uid];
        if (slctn && slctn.range && utils.isCollasped(slctn) && slctn.ids[0] === node.id) {
          if (uid === userId) {
            // 編集者に対しての処理
            if (
              slctn.range.anchor.id === selectionSnapshot.range.anchor.id &&
              slctn.range.anchor.offset.value >= selectionSnapshot.range.anchor.offset
            ) {
              slctn.range.anchor.offset.increment(chars.length);
            }
            if (
              slctn.range.focus.id === selectionSnapshot.range.focus.id &&
              slctn.range.focus.offset.value >= selectionSnapshot.range.focus.offset
            ) {
              slctn.range.focus.offset.increment(chars.length);
            }
          } else {
            // 共同編集者への処理
            if (
              slctn.range.anchor.id === selectionSnapshot.range.anchor.id &&
              slctn.range.anchor.offset.value > selectionSnapshot.range.anchor.offset
            ) {
              slctn.range.anchor.offset.increment(chars.length);
            }
            if (
              slctn.range.focus.id === selectionSnapshot.range.anchor.id &&
              slctn.range.focus.offset.value > selectionSnapshot.range.anchor.offset
            ) {
              slctn.range.focus.offset.increment(chars.length);
            }
          }
        }
      }
    },
  },
};
