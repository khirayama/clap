import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { keyBinder, Command } from './keyBinds';
import { isItemNode, focus, findUpperNode, findDownnerNode } from './utils';

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

interface EditorProps {
  selection: Clap.Selection;
  document: Clap.DocumentNode;
}

interface EditorState {
  selection: Clap.PureSelection;
  document: Clap.PureDocumentNode;
}

export class Editor extends React.Component<EditorProps, EditorState> {
  public ref: {
    self: React.RefObject<HTMLDivElement>;
    items: {
      [key: string]: {
        item: React.RefObject<Clap.Item>;
        component: React.RefObject<any>;
      };
    };
  } = {
    self: React.createRef(),
    items: {},
  };

  constructor(props: EditorProps) {
    super(props);

    this.state = {
      selection: this.props.selection.toJSON(),
      document: this.props.document.toJSON(),
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  public componentDidMount() {
    this.props.selection.on(() => {
      this.setState({ selection: this.props.selection.toJSON() });
    });
    this.props.document.on(() => {
      this.setState({ document: this.props.document.toJSON() });
    });
  }

  public componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    if (this.state.selection.mode === 'select' && prevState.selection.mode !== 'select' && this.ref.self.current) {
      this.ref.self.current.focus();
    }
  }

  private focusComponent(pos: 'beginning' | 'end') {
    // FYI: focusComponent have to wait next tick of `setState` to make sure target focus.
    setTimeout(() => {
      const target = this.ref.items[this.state.selection.id];
      const targetNode = this.props.document.find(this.state.selection.id);
      if (target && isItemNode(targetNode) && targetNode.contents) {
        focus(target.component.current.ref.text.current.ref.self.current, pos);
      } else {
        this.props.selection.mode = 'select';
        this.props.selection.dispatch();
      }
    }, 0);
  }

  // EventHandler
  private onFocus() {
    // TODO: Usecase
    this.props.selection.mode = 'select';
    if (this.props.selection.id === null) {
      this.props.selection.id = this.props.document.nodes[0].id;
    }
    this.props.selection.dispatch();
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const selection = this.state.selection;
    const mode = selection.mode;
    const currentNode = this.props.document.find(selection.id);

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
      // TODO: Usecase
      case command === Command.DOWN: {
        let targetNode = findDownnerNode(currentNode);
        if (mode === 'insert') {
          while (targetNode && isItemNode(targetNode) && targetNode.contents === null) {
            targetNode = findDownnerNode(targetNode);
          }
        }
        if (targetNode) {
          this.props.selection.id = targetNode.id;
          this.props.selection.dispatch();
        }
        if (mode === 'insert') {
          this.focusComponent('end');
        }
        break;
      }
      // TODO: Usecase
      case command === Command.UP: {
        let targetNode = findUpperNode(currentNode);
        if (mode === 'insert') {
          while (targetNode && isItemNode(targetNode) && targetNode.contents === null) {
            targetNode = findUpperNode(targetNode);
          }
        }
        if (targetNode) {
          this.props.selection.id = targetNode.id;
          this.props.selection.dispatch();
        }
        if (mode === 'insert') {
          this.focusComponent('end');
        }
        break;
      }
      // TODO: Usecase
      case command === Command.INSERT: {
        this.props.selection.mode = 'insert';
        this.props.selection.dispatch();
        this.focusComponent('end');
        break;
      }
      // TODO: Usecase
      case command === Command.INSERT_BEGINNING: {
        this.props.selection.mode = 'insert';
        this.props.selection.dispatch();
        this.focusComponent('beginning');
        break;
      }
    }
  }

  private renderItems(nodes: Clap.ItemNode[], indent: number = 0, items: JSX.Element[] = []): JSX.Element[] {
    for (const node of nodes) {
      const Component = Clap.ComponentPool.take(node.type);
      this.ref.items[node.id] = {
        item: React.createRef(),
        component: React.createRef(),
      };
      if (Component) {
        items.push(
          <Clap.Item
            ref={this.ref.items[node.id].item}
            key={node.id}
            indent={indent}
            node={node}
            selection={this.props.selection}
          >
            <Component ref={this.ref.items[node.id].component} node={node} selection={this.state.selection} />
          </Clap.Item>,
        );
      }

      if (node.nodes) {
        items.concat(this.renderItems(node.nodes, indent + 1, items));
      }
    }

    return items;
  }

  public render(): JSX.Element {
    return (
      <Wrapper ref={this.ref.self} tabIndex={0} onKeyDown={this.onKeyDown} onFocus={this.onFocus}>
        {this.renderItems(this.props.document.nodes)}
      </Wrapper>
    );
  }
}
