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
  // Transform using Selection and Node
  util: {
    insertText: (selection: Selection, document: DocumentNode, chars: string[]): void => {
      const inline = traversal.inline.findCurrentInline(selection, document);

      if (inline && selection.range) {
        transform.inline.insert(inline, selection.range.anchor.offset.value, chars);
        selection.range.anchor.offset.increment(chars.length);
        selection.range.focus.offset.increment(chars.length);
      }
    },
  },
};
