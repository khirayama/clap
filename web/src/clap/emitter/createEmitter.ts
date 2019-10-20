import * as Clap from '../index';

import * as handlers from './handlers';

export const USECASE = {
  UP: Symbol(),
  DOWN: Symbol(),
  SELECT_MODE: Symbol(),
  INSERT_MODE: Symbol(),
};

export interface EmitterPayload {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

export function createEmitter() {
  const emitter = new Clap.Emitter<EmitterPayload>();

  emitter
    .addListener(USECASE.UP, handlers.up)
    .addListener(USECASE.DOWN, handlers.down)
    .addListener(USECASE.INSERT_MODE, handlers.insertMode)
    .addListener(USECASE.SELECT_MODE, handlers.selectMode);

  return emitter;
}
