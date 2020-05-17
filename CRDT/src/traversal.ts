// nothing
import { Selection, utils } from './selection';
import { DocumentNode, ItemNode } from './node';
import { Inline } from './inline';

export function traversal(document: DocumentNode) {
  const methods = {
    node: {
      find: (id: string): DocumentNode | ItemNode | null => {
        const queue: (DocumentNode | ItemNode)[] = [];
        queue.push(document);

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

      findCurrentNode: (selection: Selection): DocumentNode | ItemNode | null => {
        if (selection.anchor === null || selection.focus === null) {
          return null;
        }
        return methods.node.find(selection.anchor);
      },

      findCurrentNodes: (selection: Selection): (DocumentNode | ItemNode | null)[] => {
        const nodes: (DocumentNode | ItemNode | null)[] = [];

        if (selection.anchor === null || selection.focus === null) return nodes;

        const head = methods.node.find(selection.anchor);

        if (head === null || head.parent === null) return nodes;

        const parentNode = methods.node.find(head.parent);

        if (parentNode === null || (parentNode !== null && parentNode.nodes === null)) return nodes;

        if (selection.anchor === selection.focus) {
          nodes.push(head);
        } else {
          let flag = false;
          for (let i = 0; i < parentNode.nodes.length; i += 1) {
            const node = parentNode.nodes[i];

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
      find: (node: ItemNode, id: string): Inline | null => {
        if (node.inline) {
          for (const inline of node.inline) {
            if (inline.id === id) {
              return inline;
            }
          }
        }
        return null;
      },

      findCurrentInline: (selection: Selection): Inline | null => {
        if (selection.range && utils.isCollasped(selection)) {
          const node = methods.node.findCurrentNode(selection);

          if (node && node.object === 'item' && selection.range) {
            return methods.inline.find(node, selection.range.anchor.id);
          }
        }
        return null;
      },
    },
  };

  return methods;
}
