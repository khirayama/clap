import { DocumentNode, ItemNode } from './node';
import { Selection, utils } from './selection';
import { traversal } from './traversal';

export const transform = {
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
  inline: {
    insert: (selection: Selection, document: DocumentNode, ...chars: string[]): void => {
      if (selection.range && utils.isCollasped(selection)) {
        const node = traversal.node.find(document, selection.ids[0]);

        if (node) {
          const inline = traversal.inline.find(node, selection.range.anchor.id);

          if (inline) {
            inline.text.splice(selection.range.anchor.offset.value, 0, ...chars);
            selection.range.anchor.offset.increment(chars.length);
            selection.range.focus.offset.increment(chars.length);
          }
        }
      }
    },
  },
};
