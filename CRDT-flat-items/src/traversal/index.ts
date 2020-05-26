// nothing
import { Selection, Document, Item, Inline, utils } from '../structures';

export function traversal(document: Document) {
  const traverse = {
    item: {
      find: (id: string): Item | null => {
        for (const item of document.items) {
          if (item.id === id) {
            return item;
          }
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

        let flag = false;

        for (const item of document.items) {
          if (item.id === selection.anchor && item.id === selection.focus) {
            items.push(item);
            return items;
          } else if (item.id === selection.anchor || item.id === selection.focus) {
            flag = !flag;
            items.push(item);
          } else if (flag) {
            items.push(item);
          }
        }

        return items;
      },
    },

    inline: {
      find: (id: string, itemId?: string): Inline | null => {
        if (itemId) {
          const item = traverse.item.find(itemId);
          if (item !== null && item.inline !== null) {
            for (const inline of item.inline) {
              if (inline.id === id) {
                return inline;
              }
            }
          }
        } else {
          for (const item of document.items) {
            if (item.inline !== null) {
              for (const inline of item.inline) {
                if (inline.id === id) {
                  return inline;
                }
              }
            }
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
