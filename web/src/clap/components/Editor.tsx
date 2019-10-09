import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../nodes/index';
import { ComponentPool } from './ComponentPool';
import { Item, ItemProps } from './Item';

const KEY_CODE = {
  ENTER: 13,
  ESC: 27,
  UP: 38,
  DOWN: 40,
  C: 67,
  I: 73,
  J: 74,
  K: 75,
};

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
    console.log(event);
    console.log(keyCode, meta, shift, ctrl);

    const cursor = this.state.cursor;
    const mode = cursor.mode;
    const currentNode = this.props.document.find(cursor.id);

    if (mode === 'select') {
      switch (true) {
        case keyCode === KEY_CODE.DOWN || keyCode === KEY_CODE.J: {
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
        case keyCode === KEY_CODE.UP || keyCode === KEY_CODE.K: {
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
        case keyCode === KEY_CODE.ENTER || keyCode === KEY_CODE.I: {
          this.setState({
            cursor: {
              id: cursor.id,
              mode: 'insert',
            },
          });
          break;
        }
      }
    }

    if (mode === 'insert') {
      switch (true) {
        case keyCode === KEY_CODE.ESC || (keyCode === KEY_CODE.C && ctrl): {
          this.setState({
            cursor: {
              id: cursor.id,
              mode: 'select',
            },
          });
          break;
        }
        case keyCode === KEY_CODE.ENTER: {
          const node = new ClapNode.ParagraphNode();
          currentNode.after(node);
          console.log('ADD', node);
          break;
        }
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

    return (
      <Wrapper tabIndex={0} onKeyDown={this.onKeyDown} onFocus={this.onFocus}>
        {this.renderLines(doc.nodes)}
      </Wrapper>
    );
  }
}
