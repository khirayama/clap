import { traversal } from '../traversal';
import { Board, Selection, Document, Item, Decoration } from '../structures';

export function getStartAndEnd(selection: Selection, item: Item) {
  let start = null;
  let end = null;

  if (selection.range === null || item.inline === null) {
    return { start, end };
  }
  const anchor = selection.range.anchor;
  const focus = selection.range.focus;

  if (anchor.id === focus.id) {
    if (anchor.offset.value < focus.offset.value) {
      return {
        start: anchor,
        end: focus,
      };
    } else {
      return {
        start: focus,
        end: anchor,
      };
    }
  }

  for (let i = 0; i < item.inline.length; i += 1) {
    const inline = item.inline[i];

    if (start === null) {
      if (inline.id === anchor.id) {
        start = anchor;
      } else if (inline.id === focus.id) {
        start = focus;
      }
    } else {
      if (inline.id === anchor.id) {
        end = anchor;
      } else if (inline.id === focus.id) {
        end = focus;
      }
    }
  }

  return {
    start,
    end,
  };
}

export function hasSameMarks(marks1: Decoration[], marks2: Decoration[]): boolean {
  if (marks1.length !== marks2.length) {
    return false;
  }
  for (const mark of marks1) {
    if (!marks2.includes(mark)) {
      return false;
    }
  }
  return true;
}

export function getMemberIds(userId: string, users: Board['users']): string[] {
  return Object.keys(users).filter((uid) => uid !== userId);
}

export function isAnchorUpper(document: Document, anchorId: string, focusId: string): boolean {
  let isFocusIdAppeared = false;
  for (let i = 0; i < document.items.length; i += 1) {
    const item = document.items[i];

    if (item.id === focusId) {
      isFocusIdAppeared = true;
    }
    if (isFocusIdAppeared === false && item.id === anchorId) {
      return true;
    }
  }

  return false;
}
