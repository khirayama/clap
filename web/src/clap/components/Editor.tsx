import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { keyBinder, Command } from './keyBinds';
import { isItemNode, focus } from './utils';

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
  document: Clap.PureNode;
}

interface EditorState {
  selection: Clap.PureSelection;
  document: Clap.PureNode;
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

  private emitter: Clap.Emitter<Clap.EmitterPayload>;

  private selection: Clap.Selection;

  private document: Clap.DocumentNode;

  constructor(props: EditorProps) {
    super(props);

    this.emitter = Clap.createEmitter();
    this.document = new Clap.DocumentNode(props.document);
    this.selection = new Clap.Selection();

    this.state = {
      selection: this.selection.toJSON(),
      document: this.document.toJSON(),
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  private emit(usecase: Symbol) {
    const payload = { document: this.document, selection: this.selection };
    this.emitter.emit(usecase, payload);
  }

  public componentDidMount() {
    this.selection.on(() => {
      this.setState({ selection: this.selection.toJSON() });
    });
    this.document.on(() => {
      this.setState({ document: this.document.toJSON() });
    });
  }

  public componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    if (this.state.selection.mode === 'select' && prevState.selection.mode !== 'select' && this.ref.self.current) {
      this.ref.self.current.focus();
    }
  }

  private focusComponent(pos: 'beginning' | 'end') {
    // TODO: Migrate it to handler
    // FYI: focusComponent have to wait next tick of `setState` to make sure target focus.
    setTimeout(() => {
      const target = this.ref.items[this.state.selection.id];
      const targetNode = this.document.find(this.state.selection.id);
      if (target && isItemNode(targetNode) && targetNode.contents) {
        focus(target.component.current.ref.text.current.ref.self.current, pos);
      } else {
        this.selection.mode = 'select';
        this.selection.dispatch();
      }
    }, 0);
  }

  // EventHandler
  private onFocus() {
    // TODO: Usecase
    this.selection.mode = 'select';
    if (this.selection.id === null) {
      this.selection.id = this.document.nodes[0].id;
    }
    this.selection.dispatch();
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const selection = this.state.selection;
    const mode = selection.mode;

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
        this.emit(Clap.USECASE.DOWN);
        if (mode === 'insert') {
          this.focusComponent('end');
        }
        break;
      }
      // TODO: Usecase
      case command === Command.UP: {
        this.emit(Clap.USECASE.UP);
        if (mode === 'insert') {
          this.focusComponent('end');
        }
        break;
      }
      // TODO: Usecase
      case command === Command.INSERT: {
        this.emit(Clap.USECASE.INSERT_MODE);
        this.focusComponent('end');
        break;
      }
      // TODO: Usecase
      case command === Command.INSERT_BEGINNING: {
        this.emit(Clap.USECASE.INSERT_MODE);
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
            selection={this.selection}
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
        {this.renderItems(this.document.nodes)}
      </Wrapper>
    );
  }
}
