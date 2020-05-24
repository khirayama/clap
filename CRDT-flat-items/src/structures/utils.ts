import { Selection } from './selection';

export const utils = {
  getOffset: (curOffset: number, offset: number) => {
    return offset - curOffset;
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
