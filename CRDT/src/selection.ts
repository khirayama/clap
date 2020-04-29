import * as Automerge from 'automerge';

export type Selection = {
  isComposing: boolean;
  compositionText: string;
  ids: string[];
  range: {
    anchor: {
      id: string;
      offset: Automerge.Counter;
    };
    focus: {
      id: string;
      offset: Automerge.Counter;
    };
  } | null;
};

export const utils = {
  mode: (selection: Selection): 'normal' | 'select' | 'insert' => {
    if (selection.ids.length === 0) {
      return 'normal';
    } else if (selection.range === null) {
      return 'select';
    } else {
      return 'insert';
    }
  },

  isCollasped: (selection: Selection): boolean => {
    return !!(
      selection.ids.length === 1 &&
      selection.range &&
      selection.range.anchor.id === selection.range.focus.id &&
      selection.range.anchor.offset.value === selection.range.focus.offset.value
    );
  },
};
