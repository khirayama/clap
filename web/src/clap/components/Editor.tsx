import * as React from 'react';

import * as ClapNode from '../nodes/index';
import { ComponentPool } from './ComponentPool';

interface EditorProps {
  document: ClapNode.DocumentNode;
}

interface EditorState {
  cursor: {
    id: string | null;
    mode: 'normal' | 'select' | 'insert';
  };
  document: ClapNode.PureDocumentNode;
}

interface ItemProps {
  indent: number;
}

class Item extends React.Component<ItemProps> {
  public render(): JSX.Element {
    const indent = this.props.indent;

    return <div style={{ paddingLeft: `${indent * 10}px` }}>{this.props.children}</div>;
  }
}

export class Editor extends React.Component<EditorProps, EditorState> {
  private document: ClapNode.DocumentNode;

  constructor(props: EditorProps) {
    super(props);

    this.state = {
      cursor: {
        id: null,
        mode: 'normal',
      },
      document: this.props.document.toJSON(),
    };
  }

  private renderLines(nodes: ClapNode.PureItemNode[], indent: number = 0, lines: JSX.Element[] = []): JSX.Element[] {
    for (const node of nodes) {
      const Component = ComponentPool.take(node.type);
      if (Component) {
        lines.push(
          <Item key={node.id} indent={indent}>
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

    return <div>{this.renderLines(doc.nodes)}</div>;
  }
}
