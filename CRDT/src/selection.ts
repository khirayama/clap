import * as Automerge from 'automerge';

export type Range = {
  anchor: {
    id: string;
    offset: Automerge.Counter;
  };
  focus: {
    id: string;
    offset: Automerge.Counter;
  };
};

export type Selection = {
  isComposing: boolean;
  compositionText: string;
  anchor: string | null;
  focus: string | null;
  range: Range | null;
};

export const utils = {
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

  getOffset: (curOffset: number, offset: number) => {
    return offset - curOffset;
  },
};
