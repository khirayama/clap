import { Doc } from './interfaces';
import { Selection } from './selection';
import { DocumentNode, ItemNode } from './node';
import { Decoration } from './inline';
import { traversal } from './traversal';

export function getStartAndEnd(selection: Selection, node: ItemNode) {
  let start = null;
  let end = null;

  if (selection.range === null || node.inline === null) {
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

  for (let i = 0; i < node.inline.length; i += 1) {
    const inline = node.inline[i];

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

export function getMemberIds(userId: string, users: Doc['users']): string[] {
  return Object.keys(users).filter((uid) => uid !== userId);
}

export function isAnchorUpper(document: DocumentNode, anchorId: string, focusId: string): boolean {
  const traverse = traversal(document);

  if (anchorId === focusId) return false;

  const anchorNode = traverse.node.find(anchorId);
  const focusNode = traverse.node.find(focusId);

  if (anchorNode === null || anchorNode.parent === null || focusNode === null || focusNode.parent === null)
    return false;

  if (anchorNode.parent !== focusNode.parent) return false;

  const parentNode = traverse.node.find(anchorNode.parent);

  if (parentNode === null || parentNode.nodes === null) return false;

  let isFocusIdAppeared = false;
  for (let i = 0; i < parentNode.nodes.length; i += 1) {
    const node = parentNode.nodes[i];

    if (node.id === focusId) {
      isFocusIdAppeared = true;
    }
    if (isFocusIdAppeared === false && node.id === anchorId) {
      return true;
    }
  }

  return false;
}
