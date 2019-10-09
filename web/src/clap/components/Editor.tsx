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

    this.onClickItem = this.onClickItem.bind(this);
    this.onFocusItem = this.onFocusItem.bind(this);
    this.onKeyDownItem = this.onKeyDownItem.bind(this);
    this.onKeyPressItem = this.onKeyPressItem.bind(this);
    this.onKeyUpItem = this.onKeyUpItem.bind(this);
  }

  private onClickItem(event: React.MouseEvent<HTMLDivElement>, itemProps: ItemProps) {
    this.setState({
      cursor: {
        id: itemProps.node.id,
        mode: 'insert',
      },
    });
  }

  private onFocusItem(event: React.FormEvent<HTMLDivElement>, itemProps: ItemProps) {
    this.setState({
      cursor: {
        id: itemProps.node.id,
        mode: 'select',
      },
    });
  }

  private onKeyDownItem(event: React.KeyboardEvent<HTMLDivElement>, itemProps: ItemProps) {
    const keyCode = event.keyCode;
    const meta = event.metaKey;
    const shift = event.shiftKey;
    const cursor = this.state.cursor;
    const currentNode = this.props.document.find(cursor.id);

    if (
      // mode === 'select' &&
      keyCode === KEY_CODE.DOWN
      // meta
      // shift
    ) {
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
      if (targetNode) {
        this.setState({
          cursor: {
            id: targetNode.id,
            mode: cursor.mode,
          },
        });
      }
    } else if (
      // mode === 'select' &&
      keyCode === KEY_CODE.UP
      // meta
      // shift
    ) {
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
      if (targetNode) {
        this.setState({
          cursor: {
            id: targetNode.id,
            mode: cursor.mode,
          },
        });
      }
    }
    // console.log(keyCode, meta, shift);
    // console.log(event, itemProps);
  }

  private onKeyPressItem(event: React.KeyboardEvent<HTMLDivElement>, itemProps: ItemProps) {
    const keyCode = event.keyCode;
    // console.log(keyCode);
    // console.log(event, itemProps);
  }

  private onKeyUpItem(event: React.KeyboardEvent<HTMLDivElement>, itemProps: ItemProps) {
    const keyCode = event.keyCode;
    // console.log(keyCode);
    // console.log(event, itemProps);
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
            onFocus={this.onFocusItem}
            onKeyDown={this.onKeyDownItem}
            onKeyPress={this.onKeyPressItem}
            onKeyUp={this.onKeyUpItem}
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

    return <Wrapper onKeyUp={() => console.log('keyup')}>{this.renderLines(doc.nodes)}</Wrapper>;
  }
}
