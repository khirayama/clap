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
      if (selection.anchor === null || selection.focus === null) {
        return null;
      }
      return traversal.node.find(document, selection.anchor);
    },
    findCurrentNodes: (selection: Selection, document: DocumentNode): (DocumentNode | ItemNode | null)[] => {
      const nodes: (DocumentNode | ItemNode | null)[] = [];

      if (selection.anchor === null || selection.focus === null) return nodes;

      const head = traversal.node.find(document, selection.anchor);

      if (head === null || head.parent === null) return nodes;

      const parent = traversal.node.find(document, head.parent);

      if (parent === null) return nodes;

      if (selection.anchor === selection.focus) {
        nodes.push(head);
      } else {
        let flag = false;
        for (let i = 0; i < parent.nodes.length; i += 1) {
          const node = parent.nodes[i];

          if (flag === false && (node.id === selection.anchor || node.id === selection.focus)) {
            flag = true;
            nodes.push(node);
          } else if (flag === true && (node.id === selection.anchor || node.id === selection.focus)) {
            nodes.push(node);
            break;
          } else if (flag) {
            nodes.push(node);
          }
        }
      }

      return nodes;
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
