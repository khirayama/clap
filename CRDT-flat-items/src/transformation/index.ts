// factory, traversal
import { factory } from '../factory';
import { traversal } from '../traversal';

import {
  Document,
  Item,
  ParagraphItem,
  Heading1Item,
  HorizontalRuleItem,
  Inline,
  utils as sutils,
} from '../structures';

/*
 * append: 親要素と追加したい要素を与え、親の子要素の最後に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ParentNode/append
 * prepend: 親要素と追加したい要素を与え、親の子要素の先頭に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ParentNode/prepend
 * before: 兄要素と追加したい要素を与え、兄要素の前に追加する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/before
 * after: 兄要素と追加したい要素を与え、兄要素の後ろに追加する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/after
 * remove: ドキュメントと削除したい要素を与え、自身を削除する。 https://developer.mozilla.org/ja/docs/Web/API/ChildNode/remove
 */
export function transformation(document: Document) {
  const traverse = traversal(document);

  const transform = {
    item: {
      append: (parentItem: Item, item: Item): void => {
        for (let i = 0; i < document.items.length; i += 1) {
          const itm = document.items[i];
          if (itm.id === item.id) {
            document.items.splice(i, 1);
          }
        }

        for (let i = 0; i < document.items.length; i += 1) {
          const itm = document.items[i];
          if (itm.id === parentItem.id) {
            while (document.items[i + 1] && parentItem.indent < document.items[i + 1].indent) {
              i += 1;
            }
            item.indent.increment(sutils.getOffset(item.indent.value, parentItem.indent.value + 1));
            document.items.splice(i, 0, item);
            break;
          }
        }
      },

      after: (prevItem: Item, item: Item): void => {
        for (let i = 0; i < document.items.length; i += 1) {
          const itm = document.items[i];
          if (itm.id === prevItem.id) {
            item.indent.increment(sutils.getOffset(item.indent.value, itm.indent.value));
            document.items.splice(i + 1, 0, item);
            break;
          }
        }
      },

      remove: (item: Item): void => {
        for (let i = 0; i < document.items.length; i += 1) {
          const itm = document.items[i];
          if (itm.id === item.id) {
            document.items.splice(i, 1);
            break;
          }
        }
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
              for (let i = 0; i < node.nodes.length; i += 1) {
                transform.node.outdent(node.nodes[i]);
              }
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
              for (let i = 0; i < node.nodes.length; i += 1) {
                transform.node.outdent(node.nodes[i]);
              }
              tmp.nodes = null;
            }
            break;
          }
        }
      },

      indent: (node: ItemNode): void => {
        if (node.prev === null) return;

        const upperNode = traverse.node.find(node.prev);

        if (upperNode === null) return;

        transform.node.append(upperNode, node);

        if (node.nodes === null) return;

        for (const nd of node.nodes) {
          transform.node.append(upperNode, nd);
        }
      },

      outdent: (node: ItemNode): void => {
        if (node.parent === null) return;

        const parentNode = traverse.node.find(node.parent);

        if (parentNode === null || parentNode.object === 'document') return;

        if (parentNode.nodes !== null && node.nodes !== null) {
          let isDowner = false;
          for (let i = 0; i < parentNode.nodes.length; i += 1) {
            const nd = parentNode.nodes[i];
            if (nd.id === node.id) {
              isDowner = true;
            } else if (isDowner) {
              transform.node.append(node, nd);
            }
          }
        }

        transform.node.after(parentNode, node);
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

  return transform;
}
