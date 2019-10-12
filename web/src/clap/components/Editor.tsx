import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../nodes/index';
import { ComponentPool } from './ComponentPool';
import { Item, ItemProps } from './Item';
import { keyBinder, Command } from './keyBinds';

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
  private editorRef: React.RefObject<HTMLDivElement> = React.createRef();
  private itemRefs: {
    [key: string]: {
      item: React.RefObject<Item>;
      component: React.RefObject<any>;
    };
  } = {};

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
    if (this.state.cursor.mode === 'select' && prevState.cursor.mode !== 'select' && this.editorRef.current) {
      this.editorRef.current.focus();
    }
    if (this.state.cursor.mode === 'insert') {
      const target = this.itemRefs[this.state.cursor.id];
      if (
        target &&
        target.component &&
        target.component.current &&
        target.component.current.ref &&
        target.component.current.ref.current
      ) {
        this.focus(target.component.current.ref.current);
      }
    }
  }

  private focus(el: HTMLElement, position: 'beginning' | 'end' = 'end') {
    // FYI: https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
    const range: Range = document.createRange();
    /*
    FYI: If you use following lines, it doesn't work. It returns selection start and end are 1.
    Maybe it is react's problem. Raw content editable doesn't have.
    ```
    range.selectNodeContents(el);
    range.collapse(false);
    ```
    */
    let pos = el.innerHTML.length;
    if (position === 'beginning') {
      pos = 0;
    }
    range.setStart(el.childNodes[0] || el, pos);
    range.setEnd(el.childNodes[0] || el, pos);
    const selection: Selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
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
    const cursor = this.state.cursor;
    const mode = cursor.mode;
    const currentNode = this.props.document.find(cursor.id);

    const keyMap = {
      mode,
      keyCode: event.keyCode,
      meta: event.metaKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
    };
    const command = keyBinder.getCommand(keyMap, event);

    if (command !== null) {
      event.preventDefault();
    }

    switch (true) {
      case command === Command.DOWN: {
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
      this.itemRefs[node.id] = {
        item: React.createRef(),
        component: React.createRef(),
      };
      if (Component) {
        lines.push(
          <Item
            ref={this.itemRefs[node.id].item}
            key={node.id}
            indent={indent}
            node={node}
            cursor={this.state.cursor}
            onClick={this.onClickItem}
            onKeyDown={this.onKeyDown}
          >
            <Component ref={this.itemRefs[node.id].component} node={node} cursor={this.state.cursor} />
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
      <Wrapper ref={this.editorRef} tabIndex={0} onKeyDown={this.onKeyDown} onFocus={this.onFocus}>
        {this.renderLines(doc.nodes)}
      </Wrapper>
    );
  }
}
