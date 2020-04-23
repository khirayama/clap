import { DocumentNode, ItemNode } from './node';

export const transform = {
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
};
