// factory/traversal
import { DocumentNode, ItemNode } from './node';
import { traversal } from './traversal';
import { Inline } from './inline';

/*
 * append: 親要素と追加したい要素を与え、親の子要素の最後に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ParentNode/append
 * prepend: 親要素と追加したい要素を与え、親の子要素の先頭に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ParentNode/prepend
 * before: 兄要素と追加したい要素を与え、兄要素の前に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/before
 * after: 兄要素と追加したい要素を与え、兄要素の後ろに追加する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/after
 * remove: ドキュメントと削除したい要素を与え、自身を削除する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/remove
 */

export const transform = {
  node: {
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
    insertText: (inline: Inline, index: number, chars: string[]) => {
      inline.text.splice(index, 0, ...chars);
    },
    deleteText: (inline: Inline, index: number, count: number) => {
      inline.text.splice(index, count);
    },
    remove: (document: DocumentNode, inline: Inline): void => {
      if (inline.parent === null) return;

      const node = traversal.node.find(document, inline.parent);

      if (node === null) return;

      if (node.inline) {
        for (let i = 0; i < node.inline.length; i += 1) {
          const inl = node.inline[i];
          if (inl.id === inline.id) {
            node.inline.splice(i, 1);
            return;
          }
        }
      }
    },
  },
};
