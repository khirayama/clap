// factory, traversal
import { factory } from '../factory';

import {
  Document,
  SuperItem,
  Item,
  ParagraphItem,
  Heading1Item,
  HorizontalRuleItem,
  Inline,
  utils as sutils,
} from '../structures';
import { traversal } from '../traversal';

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
      append: (item: Item): Item | null => {
        transform.item.remove(item);
        document.items.push(item);
        return traverse.item.find(item.id);
      },

      after: (prevItem: Item, item: Item): Item | null => {
        transform.item.remove(item);

        let tmp: Item | null = null;
        for (let i = 0; i < document.items.length; i += 1) {
          const itm = document.items[i];
          if (itm.id === prevItem.id) {
            document.items.splice(i + 1, 0, item);
            tmp = document.items[i + 1];
            tmp.indent.increment(sutils.getOffset(item.indent.value, itm.indent.value));
            break;
          }
        }

        return tmp;
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

      appendInline: (item: Item, inline: Inline): Inline | null => {
        if (item.inline === null) return null;

        inline.parent = item.id;
        item.inline.push(inline);
        return traverse.inline.find(inline.id, item.id);
      },

      turnInto: (item: Item, itemType: SuperItem['type']): void => {
        switch (itemType) {
          case 'paragraph': {
            const tmp = item as ParagraphItem;
            tmp.type = 'paragraph';
            if (item.inline === null) {
              tmp.inline = [];
              const inline = factory.inline.createInlineText();
              transform.item.appendInline(tmp, inline);
            }
            break;
          }
          case 'heading1': {
            const tmp = item as Heading1Item;
            tmp.type = 'heading1';
            if (item.inline === null) {
              tmp.inline = [];
              const inline = factory.inline.createInlineText();
              transform.item.appendInline(tmp, inline);
            }
            break;
          }
          case 'horizontal-rule': {
            const tmp = item as HorizontalRuleItem;
            tmp.type = 'horizontal-rule';
            if (item.inline !== null) {
              tmp.inline = null;
            }
            break;
          }
        }
      },

      indent: (item: Item): void => {
        item.indent.increment(1);
      },

      outdent: (item: Item): void => {
        item.indent.decrement(1);
      },
    },

    inline: {
      remove: (item: Item, inline: Inline): void => {
        if (item.inline) {
          for (let i = 0; i < item.inline.length; i += 1) {
            const inl = item.inline[i];
            if (inl.id === inline.id) {
              item.inline.splice(i, 1);
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
