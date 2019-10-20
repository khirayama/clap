import * as Clap from '../index';

import { isItemNode, findUpperNode, findDownnerNode } from './utils';

export function up(payload: Clap.EmitterPayload) {
  const currentNode = payload.document.find(payload.selection.id);
  const mode = payload.selection.mode;

  let targetNode = findUpperNode(currentNode);
  if (mode === 'insert') {
    while (targetNode && isItemNode(targetNode) && targetNode.contents === null) {
      targetNode = findUpperNode(targetNode);
    }
  }
  if (targetNode) {
    payload.selection.id = targetNode.id;
    payload.selection.dispatch();
  }
}

export function down(payload: Clap.EmitterPayload) {
  const currentNode = payload.document.find(payload.selection.id);
  const mode = payload.selection.mode;

  let targetNode = findDownnerNode(currentNode);
  if (mode === 'insert') {
    while (targetNode && isItemNode(targetNode) && targetNode.contents === null) {
      targetNode = findDownnerNode(targetNode);
    }
  }
  if (targetNode) {
    payload.selection.id = targetNode.id;
    payload.selection.dispatch();
  }
}

export function insertMode(payload: Clap.EmitterPayload) {
  payload.selection.mode = 'insert';
  payload.selection.dispatch();
}

export function selectMode(payload: Clap.EmitterPayload) {
  payload.selection.mode = 'select';
  payload.selection.dispatch();
}
