import * as Clap from '../index';

export const USECASE = {
  UP: Symbol(),
};

export interface EmitterPayload {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

export function createEmitter() {
  const emitter = new Clap.Emitter<EmitterPayload>();

  emitter.addListener(USECASE.UP, payload => {
    console.log('up', payload);
  });

  return emitter;
}
