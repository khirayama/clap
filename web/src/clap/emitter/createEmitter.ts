import * as Clap from '../index';

export interface EmitterPayload {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

export function createEmitter() {
  const emitter = new Clap.Emitter<EmitterPayload>();

  return emitter;
}
