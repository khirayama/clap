import * as Clap from '../index';

export function windowSelectionToClapSelection(
  document: Clap.DocumentNode,
  selection: Clap.Selection,
  ref: Clap.Editor['ref'],
): Clap.PureSelection['range'] | null {
  const windowSelection = window.getSelection();
  const clapSelection = selection.toJSON();
  if (windowSelection.anchorNode === null) {
    return null;
  }

  if (windowSelection.anchorNode && windowSelection.focusNode) {
    const contentRef = ref.items[clapSelection.id].contents;
    const currentNode = document.find(clapSelection.id);
    let startElementIndex = null;
    let endElementIndex = null;

    for (let i = 0; i < contentRef.current.childNodes.length; i += 1) {
      const childNode = contentRef.current.childNodes[i];
      let targetStartNode = windowSelection.anchorNode;
      while (targetStartNode.parentNode && targetStartNode.parentNode !== contentRef.current) {
        targetStartNode = targetStartNode.parentNode;
      }
      let targetEndNode = windowSelection.focusNode;
      while (targetEndNode.parentNode && targetEndNode.parentNode !== contentRef.current) {
        targetEndNode = targetEndNode.parentNode;
      }
      if (targetStartNode === childNode) {
        startElementIndex = i;
      }
      if (targetEndNode === childNode) {
        endElementIndex = i;
      }
    }
    if (startElementIndex !== null && endElementIndex !== null) {
      const anchorContent = currentNode.contents[startElementIndex];
      const focusContent = currentNode.contents[endElementIndex];
      const range = {
        anchor: {
          id: anchorContent.id,
          offset: windowSelection.anchorOffset,
        },
        focus: {
          id: focusContent.id,
          offset: windowSelection.focusOffset,
        },
      };
      return range;
    }
  }
  return null;
}
