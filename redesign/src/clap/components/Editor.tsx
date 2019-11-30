import * as React from 'react';
import styled from 'styled-components';

import { DocumentNode } from '../nodes';
import { Selection } from '../selection';

const Wrapper = styled.div``;

interface EditorProps {
  document: DocumentNode;
  selection: Selection;
}

export function Editor(props: EditorProps) {
  React.useEffect(() => {
    console.log('mount');
    props.document.on(() => {
      console.log('change');
    });
    props.selection.on(() => {
      console.log('change');
    });
  }, []);
  return <Wrapper />;
}
