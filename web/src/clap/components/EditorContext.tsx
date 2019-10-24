import * as React from 'react';

import { Editor } from './Editor';

const initialContext: {
  emit: Editor['emit'] | null;
  ref: Editor['ref'];
  mapping: Editor['mapping'];
} = {
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
