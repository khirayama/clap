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
    if (targetNode.contents) {
      payload.selection.range = {
        anchor: {
          id: targetNode.contents[targetNode.contents.length - 1].id,
          offset: targetNode.contents[targetNode.contents.length - 1].text.length,
        },
        focus: {
          id: targetNode.contents[targetNode.contents.length - 1].id,
          offset: targetNode.contents[targetNode.contents.length - 1].text.length,
        },
      };
    }
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
    if (targetNode.contents) {
      payload.selection.range = {
        anchor: {
          id: targetNode.contents[targetNode.contents.length - 1].id,
          offset: targetNode.contents[targetNode.contents.length - 1].text.length,
        },
        focus: {
          id: targetNode.contents[targetNode.contents.length - 1].id,
          offset: targetNode.contents[targetNode.contents.length - 1].text.length,
        },
      };
    }
    payload.selection.dispatch();
  }
}

type InsertMode = BaseAction<'INSERT_MODE', { id?: string }>;

export function insertMode(payload: InsertMode['payload']) {
  const currentNode = payload.document.find(payload.id || payload.selection.id);

  if (currentNode.contents) {
    payload.selection.mode = 'insert';
    payload.selection.id = payload.id || payload.selection.id;
    if (currentNode.contents) {
      payload.selection.range = {
        anchor: {
          id: currentNode.contents[currentNode.contents.length - 1].id,
          offset: currentNode.contents[currentNode.contents.length - 1].text.length,
        },
        focus: {
          id: currentNode.contents[currentNode.contents.length - 1].id,
          offset: currentNode.contents[currentNode.contents.length - 1].text.length,
        },
      };
    }
    payload.selection.dispatch();
  }
}

type InsertModeBeginning = BaseAction<'INSERT_MODE_BEGINNING', { id?: string }>;

export function insertModeBeginning(payload: InsertModeBeginning['payload']) {
  const currentNode = payload.document.find(payload.id || payload.selection.id);

  payload.selection.mode = 'insert';
  payload.selection.id = payload.id || payload.selection.id;
  if (currentNode.contents) {
    payload.selection.range = {
      anchor: {
        id: currentNode.contents[0].id,
        offset: 0,
      },
      focus: {
        id: currentNode.contents[0].id,
        offset: 0,
      },
    };
  }
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
  payload.selection.id = node.id;
  payload.selection.mode = 'insert';
  payload.selection.dispatch();
}

type SetRange = BaseAction<'SET_RANGE', { range: Clap.Selection['range'] }>;

export function setRange(payload: SetRange['payload']) {
  payload.selection.range = payload.range;
  payload.selection.dispatch();
}

type UpdateText = BaseAction<'UPDATE_TEXT', { id: Clap.Node['id']; contentId: Clap.Content['id']; text: string }>;

export function updateText(payload: UpdateText['payload']) {
  payload.document.updateText(payload.id, payload.contentId, payload.text);
}

export type Action = Up | Down | InsertMode | InsertModeBeginning | SelectMode | AddAfter | SetRange | UpdateText;

export const actionTypes = {
  UP: 'UP' as 'UP',
  DOWN: 'DOWN' as 'DOWN',
  INSERT_MODE: 'INSERT_MODE' as 'INSERT_MODE',
  INSERT_MODE_BEGINNING: 'INSERT_MODE_BEGINNING' as 'INSERT_MODE_BEGINNING',
  SELECT_MODE: 'SELECT_MODE' as 'SELECT_MODE',
  ADD_AFTER: 'ADD_AFTER' as 'ADD_AFTER',
  SET_RANGE: 'SET_RANGE' as 'SET_RANGE',
  UPDATE_TEXT: 'UPDATE_TEXT' as 'UPDATE_TEXT',
};
