// factory/traversal
import { DocumentNode, ItemNode, SuperNode, ParagraphNode, Heading1Node, HorizontalRuleNode } from './node';
import { traversal } from './traversal';
import { Inline } from './inline';
import { factory } from './factory';

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
      if (parentNode.nodes === null) return;

      const prevNode = parentNode.nodes[parentNode.nodes.length - 1];

      node.document = parentNode.document;
      node.parent = parentNode.id;
      if (prevNode) {
        prevNode.next = node.id;
        node.prev = prevNode ? prevNode.id : null;
      }
      parentNode.nodes.push(node);
    },

    remove: (document: DocumentNode, node: ItemNode): void => {
      if (node.parent === null) return;

      const parentNode = traversal.node.find(document, node.parent);

      if (parentNode === null || (parentNode !== null && parentNode.nodes === null)) return;

      let index = 0;

      for (let i = 0; i < parentNode.nodes.length; i += 1) {
        const nd = parentNode.nodes[i];
        if (nd.id === node.id) {
          index = i;
          const prevNode = parentNode.nodes[i - 1] || null;
          const nextNode = parentNode.nodes[i + 1] || null;

          if (prevNode !== null) {
            prevNode.next = nextNode !== null ? nextNode.id : null;
          }
          if (nextNode !== null) {
            nextNode.prev = prevNode !== null ? prevNode.id : null;
          }
        }
      }
      parentNode.nodes.splice(index, 1);
    },

    appendInline: (parentNode: ItemNode, inline: Inline): void => {
      if (parentNode.inline === null) return;

      inline.parent = parentNode.id;
      parentNode.inline.push(inline);
    },

    turnInto: (node: ItemNode, itemType: SuperNode['type']): void => {
      switch (itemType) {
        case 'paragraph': {
          const tmp = node as ParagraphNode;
          tmp.type = 'paragraph';
          if (node.inline === null) {
            tmp.inline = [];
            const inline = factory.inline.createInlineText();
            transform.node.appendInline(tmp, inline);
          }
          if (node.nodes === null) {
            tmp.nodes = [];
          }
          break;
        }
        case 'heading1': {
          const tmp = node as Heading1Node;
          tmp.type = 'heading1';
          if (node.inline === null) {
            tmp.inline = [];
            const inline = factory.inline.createInlineText();
            transform.node.appendInline(tmp, inline);
          }
          if (node.nodes !== null) {
            // TODO: node.nodesをアウトデントする
            tmp.nodes = null;
          }
          break;
        }
        case 'horizontal-rule': {
          const tmp = node as HorizontalRuleNode;
          tmp.type = 'horizontal-rule';
          if (node.inline !== null) {
            tmp.inline = null;
          }
          if (node.nodes !== null) {
            // TODO: node.nodesをアウトデントする
            tmp.nodes = null;
          }
          break;
        }
      }
    },
  },

  inline: {
    remove: (node: ItemNode, inline: Inline): void => {
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
    insertText: (inline: Inline, index: number, chars: string[]) => {
      inline.text.splice(index, 0, ...chars);
    },
    removeText: (inline: Inline, index: number, count: number) => {
      inline.text.splice(index, count);
    },
  },
};
