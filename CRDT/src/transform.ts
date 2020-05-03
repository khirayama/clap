// factory/traversal
import { DocumentNode, ItemNode } from './node';
import { Inline } from './inline';

/*
 * append: 親要素と追加したい要素を与え、親の子要素の最後に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ParentNode/append
 * prepend: 親要素と追加したい要素を与え、親の子要素の先頭に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ParentNode/prepend
 * before: 兄要素と追加したい要素を与え、兄要素の前に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/before
 * after: 兄要素と追加したい要素を与え、兄要素の後ろに追加する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/after
 * remove: 削除したい要素自身を与え、自身を削除する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/remove
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
    // TODO: transform.inline.removeへ変更
    removeInline: (node: ItemNode, inline: Inline): void => {
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

  inline: {
    insertText: (inline: Inline, index: number, chars: string[]) => {
      inline.text.splice(index, 0, ...chars);
    },
    deleteText: (inline: Inline, index: number, count: number) => {
      inline.text.splice(index, count);
    },
  },
};
