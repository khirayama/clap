import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../nodes/index';
import { ComponentPool } from './ComponentPool';
import { Item, ItemProps } from './Item';
import { shortcutCommander, Command, KEY_CODE } from './shortcuts';

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
  private ref: React.RefObject<HTMLDivElement> = React.createRef();

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

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
  }

  public componentDidMount() {
    this.props.document.on(() => {
      this.setState({ document: this.props.document.toJSON() });
    });
  }

  public componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    if (this.state.cursor.mode === 'select' && prevState.cursor.mode !== 'select' && this.ref.current) {
      this.ref.current.focus();
      console.log(this.ref.current);
    }
  }

  // Find
  private findDownnerNode(currentNode: ClapNode.Node): ClapNode.Node | null {
    let targetNode = null;
    if (currentNode.nodes[0]) {
      targetNode = currentNode.nodes[0];
    } else if (currentNode.next()) {
      targetNode = currentNode.next();
    } else {
      targetNode = currentNode;
      while (targetNode && !targetNode.next()) {
        targetNode = targetNode.parent();
      }
      if (targetNode) {
        targetNode = targetNode.next();
      }
    }
    return targetNode;
  }

  private findUpperNode(currentNode: ClapNode.Node): ClapNode.Node | null {
    let targetNode = null;
    if (currentNode.prev()) {
      targetNode = currentNode.prev();
      while (targetNode && targetNode.nodes.length) {
        targetNode = targetNode.nodes[targetNode.nodes.length - 1];
      }
    } else {
      if (currentNode.parent().object !== 'document') {
        targetNode = currentNode.parent();
      }
    }
    return targetNode;
  }

  // EventHandler
  private onFocus() {
    this.setState({
      cursor: {
        id: this.state.cursor.id,
        mode: 'select',
      },
    });
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keyCode = event.keyCode;
    const meta = event.metaKey;
    const shift = event.shiftKey;
    const ctrl = event.ctrlKey;

    const cursor = this.state.cursor;
    const mode = cursor.mode;
    const currentNode = this.props.document.find(cursor.id);

    const command = shortcutCommander.getCommand({ mode, keyCode, meta, ctrl, shift });

    if (keyCode === KEY_CODE.ENTER) {
      event.preventDefault();
    }

    switch (true) {
      case command === Command.DOWN: {
        event.preventDefault();
        const targetNode = this.findDownnerNode(currentNode);
        if (targetNode) {
          this.setState({
            cursor: {
              id: targetNode.id,
              mode,
            },
          });
        }
        break;
      }
      case command === Command.UP: {
        event.preventDefault();
        const targetNode = this.findUpperNode(currentNode);
        if (targetNode) {
          this.setState({
            cursor: {
              id: targetNode.id,
              mode,
            },
          });
        }
        break;
      }
      case command === Command.INSERT: {
        event.preventDefault();
        this.setState({
          cursor: {
            id: cursor.id,
            mode: 'insert',
          },
        });
        break;
      }
      case command === Command.SELECT: {
        this.setState({
          cursor: {
            id: cursor.id,
            mode: 'select',
          },
        });
        break;
      }
      case command === Command.ADD_AFTER: {
        const node = new ClapNode.ParagraphNode();
        currentNode.after(node);
        this.setState({
          cursor: {
            id: node.id,
            mode: 'insert',
          },
        });
        break;
      }
    }
  }

  private onClickItem(event: React.MouseEvent<HTMLDivElement>, itemProps: ItemProps) {
    this.setState({
      cursor: {
        id: itemProps.node.id,
        mode: 'insert',
      },
    });
  }

  private renderLines(nodes: ClapNode.PureItemNode[], indent: number = 0, lines: JSX.Element[] = []): JSX.Element[] {
    for (const node of nodes) {
      const Component = ComponentPool.take(node.type);
      if (Component) {
        lines.push(
          <Item
            key={node.id}
            indent={indent}
            node={node}
            cursor={this.state.cursor}
            onClick={this.onClickItem}
            onKeyDown={this.onKeyDown}
          >
            <Component node={node} cursor={this.state.cursor} />
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

    return (
      <Wrapper ref={this.ref} tabIndex={0} onKeyDown={this.onKeyDown} onFocus={this.onFocus}>
        {this.renderLines(doc.nodes)}
      </Wrapper>
    );
  }
}
