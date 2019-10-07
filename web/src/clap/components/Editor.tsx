import * as React from 'react';

import * as ClapNode from '../nodes/index';
import { ComponentPool } from './ComponentPool';

interface Cursor {
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

interface ItemProps {
  indent: number;
  cursorMode: Cursor['mode'];
}

class Item extends React.Component<ItemProps> {
  public render(): JSX.Element {
    const indent = this.props.indent;
    console.log(this.props);
    const style = {
      paddingLeft: `${indent * 10}px`,
      background: this.props.cursorMode === 'select' ? 'rgba(45, 170, 219, 0.3)' : '#fff',
    };

    const onFocus = (event: React.FormEvent<HTMLDivElement>) => {
      console.log(event);
      console.log('focus');
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      console.log(event);
      // event.preventDefault();
      console.log('key down');
    };

    const onKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
      console.log(event);
      // event.preventDefault();
      console.log('key up');
    };

    return (
      <div contentEditable style={style} onFocus={onFocus} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
        {this.props.children}
      </div>
    );
  }
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

    return <div onKeyUp={() => console.log('keyup')}>{this.renderLines(doc.nodes)}</div>;
  }
}
