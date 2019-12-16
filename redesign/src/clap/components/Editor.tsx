import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

const Wrapper = styled.div``;

interface EditorProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

export function Editor(props: EditorProps) {
  const [document, setDocument] = React.useState(props.document.toJSON());
  const [selection, setSelection] = React.useState(props.selection.toJSON());

  React.useEffect(() => {
    console.log('mount');
    props.document.on(() => {
      console.log('change document');
      setDocument(props.document.toJSON());
    });
    props.selection.on(() => {
      console.log('change selection');
      setSelection(props.selection.toJSON());
    });
  }, []);

  return (
    <>
      <Wrapper>
        {document.nodes.map(node => (
          <Clap.Item key={node.id} selection={selection} node={node} />
        ))}
      </Wrapper>
      <Clap.Pencil document={props.document} selection={props.selection} />
    </>
  );
}
