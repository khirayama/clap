import * as Clap from '../index';

export function isItemNode(node: any): node is Clap.ItemNode {
  return node.object === 'item';
}

export function focus(el: HTMLElement, position: 'beginning' | 'end' = 'end'): void {
  // FYI: https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
  const range: Range = document.createRange();
  /*
    FYI: If you use following lines, it doesn't work. It returns selection start and end are 1.
    Maybe it is react's problem. Raw content editable doesn't have.
    ```
    range.selectNodeContents(el);
    range.collapse(false);
    ```
   */
  let targetNode = el.childNodes[el.childNodes.length - 1] || el;
  let pos = targetNode.textContent.length;
  if (position === 'beginning') {
    targetNode = el.childNodes[0] || el;
    pos = 0;
  }
  range.setStart(targetNode.childNodes[0] || targetNode, pos);
  range.setEnd(targetNode.childNodes[0] || targetNode, pos);

  const selection: Selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function findUpperNode(currentNode: Clap.Node): Clap.Node | null {
  let targetNode = null;
  if (currentNode.prev()) {
    targetNode = currentNode.prev();
    while (targetNode && targetNode.nodes && targetNode.nodes.length) {
      targetNode = targetNode.nodes[targetNode.nodes.length - 1];
    }
  } else {
    if (currentNode.parent().object !== 'document') {
      targetNode = currentNode.parent();
    }
  }
  return targetNode;
}

export function findDownnerNode(currentNode: Clap.Node): Clap.Node | null {
  let targetNode = null;
  if (currentNode.nodes && currentNode.nodes[0]) {
    targetNode = currentNode.nodes[0];
  } else if (currentNode.next()) {
    targetNode = currentNode.next();
  } else {
    targetNode = currentNode;
    while (targetNode && !targetNode.next()) {
      targetNode = targetNode.parent();
    }
    if (targetNode) {
      targetNode = targetNode.next();
    }
  }
  return targetNode;
}
