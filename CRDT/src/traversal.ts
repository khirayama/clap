// nothing
import { Selection, utils } from './selection';
import { DocumentNode, ItemNode } from './node';
import { Inline } from './inline';

export const traversal = {
  node: {
    find: (node: DocumentNode | ItemNode, id: string): DocumentNode | ItemNode | null => {
      const queue: (DocumentNode | ItemNode)[] = [];
      queue.push(node);

      let tmp = queue.shift();
      while (tmp) {
        if (tmp.id === id) {
          return tmp;
        } else if (tmp.nodes) {
          queue.push(...tmp.nodes);
        }
        tmp = queue.pop();
      }
      return null;
    },
    findCurrentNode: (selection: Selection, document: DocumentNode): DocumentNode | ItemNode | null => {
      if (selection.ids.length === 0) {
        return null;
      }
      return traversal.node.find(document, selection.ids[0]);
    },
    findCurrentNodes: (selection: Selection, document: DocumentNode): (DocumentNode | ItemNode | null)[] => {
      return selection.ids.map((id) => {
        return traversal.node.find(document, id);
      });
    },
  },
  inline: {
    find: (node: DocumentNode | ItemNode, id: string): Inline | null => {
      if (node.inline) {
        for (const inline of node.inline) {
          if (inline.id === id) {
            return inline;
          }
        }
      }
      return null;
    },
    findCurrentInline: (selection: Selection, document: DocumentNode): Inline | null => {
      if (selection.range && utils.isCollasped(selection)) {
        const node = traversal.node.findCurrentNode(selection, document);
        if (node && selection.range) {
          return traversal.inline.find(node, selection.range.anchor.id);
        }
      }
      return null;
    },
  },
};
