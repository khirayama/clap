import * as React from 'react';

import * as Clap from '../index';

const initialContext: {
  selection: Clap.Selection | null;
  emit: Clap.Editor['emit'] | null;
  ref: Clap.Editor['ref'];
  mapping: Clap.Editor['mapping'];
} = {
  selection: null,
  emit: null,
  ref: {
    document: null,
    items: {},
  },
  mapping: {
    document: null,
    items: {},
  },
};

export const EditorContext = React.createContext(initialContext);
