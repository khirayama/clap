import * as React from 'react';

import { Editor } from './Editor';

interface Mapping {
  document: React.RefObject<HTMLDivElement> | null;
  items: {
    [id: string]: {
      item: React.RefObject<any>;
      component: React.RefObject<any>;
      contents: {
        [id: string]: React.RefObject<any>;
      };
    };
  };
}

const initialContext: {
  emit: Editor['emit'] | null;
  mapping: Mapping;
} = {
  emit: null,
  mapping: {
    document: null,
    items: {},
  },
};

export const EditorContext = React.createContext(initialContext);
