import * as Clap from '../index';

import * as handlers from './handlers';

function logMiddleware(type: string | Symbol, payload: handlers.Action) {
  console.log(payload);
}

export const ACTION = Symbol();

export function createEmitter() {
  const emitter = new Clap.Emitter<handlers.Action>();

  emitter.use(logMiddleware).addListener(ACTION, (action: handlers.Action) => {
    switch (action.type) {
      case handlers.actionTypes.UP: {
        handlers.up(action.payload);
        break;
      }
      case handlers.actionTypes.DOWN: {
        handlers.down(action.payload);
        break;
      }
      case handlers.actionTypes.INSERT_MODE: {
        handlers.insertMode(action.payload);
        break;
      }
      case handlers.actionTypes.INSERT_MODE_BEGINNING: {
        handlers.insertModeBeginning(action.payload);
        break;
      }
      case handlers.actionTypes.SELECT_MODE: {
        handlers.selectMode(action.payload);
        break;
      }
      case handlers.actionTypes.ADD_AFTER: {
        handlers.addAfter(action.payload);
        break;
      }
      case handlers.actionTypes.SET_RANGE: {
        handlers.setRange(action.payload);
        break;
      }
    }
  });

  return emitter;
}
