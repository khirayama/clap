import * as Clap from '../index';

import * as handlers from './handlers';

export const USECASE = {
  UP: Symbol(),
  DOWN: Symbol(),
  SELECT_MODE: Symbol(),
  INSERT_MODE: Symbol(),
  ADD_AFTER: Symbol(),
};

export interface EmitterPayload {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
  data?: {
    id: string;
  };
}

function logMiddleware(type: string | Symbol, payload: EmitterPayload) {
  let typeName = '';
  for (const key of Object.keys(USECASE)) {
    if (USECASE[key] === type) {
      typeName = key;
    }
  }
  if (typeName) {
    console.log(typeName, payload);
  }
}

export function createEmitter() {
  const emitter = new Clap.Emitter<EmitterPayload>();

  emitter
    .use(logMiddleware)
    .addListener(USECASE.UP, handlers.up)
    .addListener(USECASE.DOWN, handlers.down)
    .addListener(USECASE.INSERT_MODE, handlers.insertMode)
    .addListener(USECASE.SELECT_MODE, handlers.selectMode)
    .addListener(USECASE.ADD_AFTER, handlers.addAfter);

  return emitter;
}
