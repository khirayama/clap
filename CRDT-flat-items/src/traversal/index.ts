// nothing
import { Selection, Document, Item, Inline, utils } from '../structures';

export function traversal(document: Document) {
  const traverse = {
    item: {
      find: (id: string): Item | null => {
        let item = document.item;

        while (item) {
          if (item.id === id) {
            return item;
          }
          item = item.next;
        }
        return null;
      },

      findCurrentItem: (selection: Selection): Item | null => {
        if (selection.anchor === null || selection.focus === null) {
          return null;
        }
        return traverse.item.find(selection.anchor);
      },

      findCurrentItems: (selection: Selection): Item[] => {
        const items: Item[] = [];

        let item = document.item;
        let flag = false;

        while (item) {
          if (item.id === selection.anchor || item.id === selection.focus) {
            flag = !flag;
            items.push(item);
          } else if (flag) {
            items.push(item);
          }

          item = item.next;
        }

        return items;
      },
    },

    inline: {
      find: (id: string, itemId?: string): Inline | null => {
        let item = document.item;

        if (itemId) {
          item = traverse.item.find(itemId);
          if (item !== null && item.inline !== null) {
            for (const inline of item.inline) {
              if (inline.id === id) {
                return inline;
              }
            }
          }
        } else {
          while (item) {
            if (item.inline !== null) {
              for (const inline of item.inline) {
                if (inline.id === id) {
                  return inline;
                }
              }
            }

            item = item.next;
          }
        }

        return null;
      },

      findCurrentInline: (selection: Selection): Inline | null => {
        if (selection.anchor !== null && selection.range !== null && utils.selection.isCollasped(selection)) {
          return traverse.inline.find(selection.range.anchor.id, selection.anchor);
        }
        return null;
      },
    },
  };

  return traverse;
}
