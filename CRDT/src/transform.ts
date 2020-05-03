// factory/traversal
import { DocumentNode, ItemNode } from './node';
import { Inline } from './inline';

export const transform = {
  // Transform node itself primitively
  node: {
    // after, before, remove
    // append: Add node to the last
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
    delete: (inline: Inline, index: number, count: number) => {
      inline.text.splice(index, count);
    },
  },
};
