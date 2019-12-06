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

  function renderItems(nodes: Clap.PureNode[], indent: number = 0, items: JSX.Element[] = []) {
    for (const node of nodes) {
      items.push(
        <Clap.Item key={node.id} indent={indent} selection={selection} node={node}>
          {node.contents
            ? node.contents.map((content: Clap.Content) => <Clap.Inline key={content.id} content={content} />)
            : null}
        </Clap.Item>,
      );

      if (node.nodes) {
        items.concat(renderItems(node.nodes, indent + 1, items));
      }
    }

    return items;
  }

  return <Wrapper>{renderItems(document.nodes)}</Wrapper>;
}
