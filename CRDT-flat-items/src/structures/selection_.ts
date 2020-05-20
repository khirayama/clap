import * as Automerge from 'automerge';

export type Range = {
  anchor: {
    id: string;
    offset: Automerge.Counter;
  };
  focus: {
    id: string;
    offset: Automerge.Counter;
  };
};

export type Selection = {
  isComposing: boolean;
  compositionText: string;
  anchor: string | null;
  focus: string | null;
  range: Range | null;
};
