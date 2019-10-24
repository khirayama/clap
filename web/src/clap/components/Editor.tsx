import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { KeyBinder } from './KeyBinder';
import { EditorContext } from './EditorContext';
import { createKeyBinder, KeyMap } from './keyBinds';
import { isItemNode } from './utils';

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
  // FYI: id to React.RefObject
  private ref: {
    document: React.RefObject<HTMLDivElement>;
    items: {
      [id: string]: {
        item: React.RefObject<HTMLDivElement>;
        contents: React.RefObject<HTMLSpanElement>;
      };
    };
  } = {
    document: React.createRef(),
    items: {},
  };

  // FYI: id to window.Node
  private mapping: {
    document: HTMLDivElement;
    items: {
      [id: string]: {
        item: HTMLDivElement;
        contents: {
          [id: string]: ChildNode;
        };
      };
    };
  } = {
    document: null,
    items: {},
  };

  private emitter: Clap.Emitter<Clap.Action>;

  private keyBinder: KeyBinder<Clap.Action['type'], KeyMap>;

  private selection: Clap.Selection;

  private document: Clap.DocumentNode;

  constructor(props: EditorProps) {
    super(props);

    this.emitter = Clap.createEmitter();
    this.keyBinder = createKeyBinder();
    this.document = new Clap.DocumentNode(props.document);
    this.selection = new Clap.Selection();

    this.state = {
      selection: this.selection.toJSON(),
      document: this.document.toJSON(),
    };

    this.emit = this.emit.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  private emit(actionType: Clap.Action['type'], payload: Partial<Clap.Action['payload']> = {}) {
    this.emitter.emit(Clap.ACTION, {
      type: actionType,
      payload: {
        document: this.document,
        selection: this.selection,
        ...payload,
      },
    } as Clap.Action);
  }

  private mapRefToDOMNode() {
    // FYI: Map ref to mapping(id to node)
    this.mapping.document = this.ref.document.current;
    Object.keys(this.ref.items).forEach((id: string) => {
      this.mapping.items[id] = {
        item: this.ref.items[id].item.current,
        contents: {},
      };
      const node = this.document.find(id);
      if (node.contents !== null) {
        for (let i = 0; i < node.contents.length; i += 1) {
          this.mapping.items[id].contents[node.contents[i].id] = this.ref.items[id].contents.current.childNodes[i];
        }
      }
    });
  }

  public componentDidMount() {
    this.mapRefToDOMNode();

    this.selection.on(() => {
      this.setState({ selection: this.selection.toJSON() });
      console.log(this.selection.toJSON());
      // TODO: clap.selectionからfocusを起こせるようにしないといけない
    });
    this.document.on(() => {
      this.setState({ document: this.document.toJSON() });
    });

    window.document.addEventListener('selectionchange', () => {
      const range = this.windowSelectionToClapSelection();
      if (range) {
        this.emit(Clap.actionTypes.SET_RANGE, { range });
      }
    });
  }

  // public componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
  public componentDidUpdate() {
    this.mapRefToDOMNode();
    this.windowSelectionToClapSelection();

    // if (this.state.selection.mode === 'select' && prevState.selection.mode !== 'select' && this.ref.document.current) {
    //   this.ref.document.current.focus();
    // }
    // TODO: clap.selection to window.selection
  }

  private windowSelectionToClapSelection() {
    const windowSelection = window.getSelection();
    const clapSelection = this.selection.toJSON();

    if (windowSelection.anchorNode && windowSelection.focusNode) {
      const ref = this.ref.items[clapSelection.id].contents;
      const currentNode = this.document.find(clapSelection.id);
      let startElementIndex = null;
      let endElementIndex = null;

      for (let i = 0; i < ref.current.childNodes.length; i += 1) {
        const childNode = ref.current.childNodes[i];
        let targetStartNode = windowSelection.anchorNode;
        while (targetStartNode.parentNode && targetStartNode.parentNode !== ref.current) {
          targetStartNode = targetStartNode.parentNode;
        }
        let targetEndNode = windowSelection.focusNode;
        while (targetEndNode.parentNode && targetEndNode.parentNode !== ref.current) {
          targetEndNode = targetEndNode.parentNode;
        }
        if (targetStartNode === childNode) {
          startElementIndex = i;
        }
        if (targetEndNode === childNode) {
          endElementIndex = i;
        }
      }
      if (startElementIndex !== null && endElementIndex !== null) {
        const anchorContent = currentNode.contents[startElementIndex];
        const focusContent = currentNode.contents[endElementIndex];
        const range = {
          anchor: {
            id: anchorContent.id,
            offset: windowSelection.anchorOffset,
          },
          focus: {
            id: focusContent.id,
            offset: windowSelection.focusOffset,
          },
        };
        return range;
      }
    }
    return null;
  }

  private focusComponent(pos: 'beginning' | 'end') {
    // TODO: Migrate it to handler
    // FYI: focusComponent have to wait next tick of `setState` to make sure target focus.
    setTimeout(() => {
      const target = this.mapping.items[this.state.selection.id];
      const targetNode = this.document.find(this.state.selection.id);
      if (target && isItemNode(targetNode) && targetNode.contents) {
        console.log(target, pos);
        // focus(target.component.current.ref.text.current.ref.self.current, pos);
      } else {
        this.emit(Clap.actionTypes.SELECT_MODE);
      }
    }, 0);
  }

  // EventHandler
  private onFocus() {
    const id = this.selection.id ? this.selection.id : this.document.nodes[0].id;
    this.emit(Clap.actionTypes.SELECT_MODE, { id });
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
    const actionType = this.keyBinder.getAction(keyMap, event);

    if (actionType !== null) {
      event.preventDefault();
      this.emit(actionType);
    }
    // TODO: Implement focus from selection. Then delete following lines.
    // switch (true) {
    //   case command === Command.DOWN: {
    //     this.emit('DOWN');
    //     if (mode === 'insert') {
    //       this.focusComponent('end');
    //     }
    //     break;
    //   }
    //   case command === Command.UP: {
    //     this.emit('UP');
    //     if (mode === 'insert') {
    //       this.focusComponent('end');
    //     }
    //     break;
    //   }
    //   case command === Command.INSERT: {
    //     this.emit('INSERT_MODE');
    //     this.focusComponent('end');
    //     break;
    //   }
    //   case command === Command.INSERT_BEGINNING: {
    //     this.emit('INSERT_MODE');
    //     this.focusComponent('beginning');
    //     break;
    //   }
    //   case command === Command.SELECT: {
    //     this.emit('SELECT_MODE');
    //     break;
    //   }
    //   case command === Command.ADD_AFTER: {
    //     this.emit('ADD_AFTER');
    //     this.focusComponent('beginning');
    //     break;
    //   }
    // }
  }

  private renderItems(nodes: Clap.ItemNode[], indent: number = 0, items: JSX.Element[] = []): JSX.Element[] {
    for (const node of nodes) {
      const Component = Clap.ComponentPool.take(node.type);

      if (Component) {
        items.push(
          <Clap.Item key={node.id} indent={indent} node={node} selection={this.selection}>
            <Component node={node} selection={this.state.selection} emit={this.emit} />
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
      <EditorContext.Provider value={{ ref: this.ref, mapping: this.mapping, emit: this.emit }}>
        <Wrapper ref={this.ref.document} tabIndex={0} onKeyDown={this.onKeyDown} onFocus={this.onFocus}>
          {this.renderItems(this.document.nodes)}
        </Wrapper>
      </EditorContext.Provider>
    );
  }
}
