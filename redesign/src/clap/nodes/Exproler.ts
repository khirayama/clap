import * as Clap from '../index';

export const Exproler = {
  findUpperNode: (currentNode: Clap.BaseNode): Clap.BaseNode | null => {
    let targetNode = null;
    if (currentNode.prev) {
      targetNode = currentNode.prev;
      while (targetNode && targetNode.nodes && targetNode.nodes.length) {
        targetNode = targetNode.nodes[targetNode.nodes.length - 1];
      }
    } else {
      if (currentNode.parent.object !== 'document') {
        targetNode = currentNode.parent;
      }
    }
    return targetNode;
  },

  findDownnerNode: (currentNode: Clap.Node): Clap.Node | null => {
    let targetNode = null;
    if (currentNode.nodes && currentNode.nodes[0]) {
      targetNode = currentNode.nodes[0];
    } else if (currentNode.next) {
      targetNode = currentNode.next;
    } else {
      targetNode = currentNode;
      while (targetNode && !targetNode.next) {
        targetNode = targetNode.parent;
      }
      if (targetNode) {
        targetNode = targetNode.next;
      }
    }
    return targetNode;
  },
};
