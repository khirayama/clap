import { Document } from './Document';
import { Selection } from './Selection';

export const utils = {
  getOffset: (curOffset: number, offset: number): number => {
    return offset - curOffset;
  },

  item: {
    getIndex: (document: Document, id: string): number => {
      for (let i = 0; i < document.items.length; i += 1) {
        if (document.items[i].id === id) {
          return i;
        }
      }
      return -1;
    },
  },

  selection: {
    mode: (selection: Selection): 'normal' | 'select' | 'insert' => {
      if (selection.anchor === null || selection.focus === null) {
        return 'normal';
      } else if (selection.range === null) {
        return 'select';
      } else {
        return 'insert';
      }
    },

    isCollasped: (selection: Selection): boolean => {
      return !!(
        selection.anchor === selection.focus &&
        selection.range &&
        selection.range.anchor.id === selection.range.focus.id &&
        selection.range.anchor.offset.value === selection.range.focus.offset.value
      );
    },
  },
};
