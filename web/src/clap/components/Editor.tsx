import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../nodes/index';
import { ComponentPool } from './ComponentPool';
import { Item } from './Item';

const Wrapper = styled.div`
  font-family: sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;
`;

export interface Cursor {
  id: string | null;
  mode: 'normal' | 'select' | 'insert';
}

interface EditorProps {
  document: ClapNode.DocumentNode;
}

interface EditorState {
  cursor: Cursor;
  document: ClapNode.PureDocumentNode;
}

export class Editor extends React.Component<EditorProps, EditorState> {
  private document: ClapNode.DocumentNode;

  constructor(props: EditorProps) {
    super(props);

    const documentNode = props.document.toJSON();

    this.state = {
      cursor: {
        id: documentNode.nodes[0].id,
        mode: 'normal',
      },
      document: this.props.document.toJSON(),
    };
  }

  private renderLines(nodes: ClapNode.PureItemNode[], indent: number = 0, lines: JSX.Element[] = []): JSX.Element[] {
    for (const node of nodes) {
      const Component = ComponentPool.take(node.type);
      if (Component) {
        const mode = node.id === this.state.cursor.id ? 'select' : 'normal';
        lines.push(
          <Item key={node.id} indent={indent} cursorMode={mode}>
            <Component node={node} />
          </Item>,
        );
      }

      if (node.nodes) {
        lines.concat(this.renderLines(node.nodes, indent + 1, lines));
      }
    }
    return lines;
  }

  public render(): JSX.Element {
    const doc = this.state.document;

    return <Wrapper onKeyUp={() => console.log('keyup')}>{this.renderLines(doc.nodes)}</Wrapper>;
  }
}
