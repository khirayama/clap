import * as Clap from '../index';

import { isItemNode, findUpperNode, findDownnerNode } from './utils';

interface BaseAction<T, P = {}> {
  type: T;
  payload: P & {
    document: Clap.DocumentNode;
    selection: Clap.Selection;
  };
}

type Up = BaseAction<'UP'>;

export function up(payload: Up['payload']) {
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

type Down = BaseAction<'DOWN'>;

export function down(payload: Down['payload']) {
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

type InsertMode = BaseAction<'INSERT_MODE', { id?: string }>;

export function insertMode(payload: InsertMode['payload']) {
  payload.selection.mode = 'insert';
  payload.selection.id = payload.id || payload.selection.id;
  payload.selection.dispatch();
}

type SelectMode = BaseAction<'SELECT_MODE', { id?: string }>;

export function selectMode(payload: SelectMode['payload']) {
  payload.selection.mode = 'select';
  payload.selection.id = payload.id || payload.selection.id;
  payload.selection.dispatch();
}

type AddAfter = BaseAction<'ADD_AFTER'>;

export function addAfter(payload: AddAfter['payload']) {
  const currentNode = payload.document.find(payload.selection.id);
  const node = new Clap.ParagraphNode();
  currentNode.after(node);
  // TODO: Focus next item
  payload.selection.id = node.id;
  payload.selection.mode = 'insert';
  payload.selection.dispatch();
}

export type Action = Up | Down | InsertMode | SelectMode | AddAfter;

export const actionTypes = {
  UP: 'UP' as Action['type'],
  DOWN: 'DOWN' as Action['type'],
  INSERT_MODE: 'INSERT_MODE' as Action['type'],
  INSERT_MODE_BEGINNING: 'INSERT_MODE_BEGINNING' as Action['type'],
  SELECT_MODE: 'SELECT_MODE' as Action['type'],
  ADD_AFTER: 'ADD_AFTER' as Action['type'],
};
