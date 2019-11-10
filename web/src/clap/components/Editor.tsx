import deepEqual from 'fast-deep-equal';
import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { KeyBinder } from './KeyBinder';
import { EditorContext } from './EditorContext';
import { ResetStyle } from './ResetStyle';
import { createKeyBinder, KeyMap } from './keyBinds';
import { windowSelectionToClapSelection } from './utils';

const Wrapper = styled.div`
  display: inline-block;
  vertical-align: top;
  width: 100%;
`;

interface EditorProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
  readonly?: boolean;
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

  constructor(props: EditorProps) {
    super(props);

    this.emitter = Clap.createEmitter();
    this.keyBinder = createKeyBinder();

    this.state = {
      selection: this.props.selection.toJSON(),
      document: this.props.document.toJSON(),
    };

    this.emit = this.emit.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  private emit(actionType: Clap.Action['type'], payload: Partial<Clap.Action['payload']> = {}) {
    if (this.props.readonly !== true) {
      this.emitter.emit(Clap.ACTION, {
        type: actionType,
        payload: {
          document: this.props.document,
          selection: this.props.selection,
          ...payload,
        },
      } as Clap.Action);
    }
  }

  private mapRefToDOMNode() {
    // FYI: Map ref to mapping(id to node)
    this.mapping.document = this.ref.document.current;
    Object.keys(this.ref.items).forEach((id: string) => {
      this.mapping.items[id] = {
        item: this.ref.items[id].item.current,
        contents: {},
      };
      const node = this.props.document.find(id);
      if (node.contents !== null) {
        for (let i = 0; i < node.contents.length; i += 1) {
          this.mapping.items[id].contents[node.contents[i].id] = this.ref.items[id].contents.current.childNodes[i];
        }
      }
    });
  }

  public componentDidMount() {
    this.mapRefToDOMNode();

    if (this.props.readonly !== true) {
      window.document.addEventListener('selectionchange', () => {
        if (this.state.selection.mode === 'insert') {
          const range = windowSelectionToClapSelection(this.props.document, this.props.selection, this.ref);
          const clapSelection = this.props.selection.toJSON();
          if (!deepEqual(range, clapSelection.range)) {
            this.emit(Clap.actionTypes.SET_RANGE, { range });
          }
        } else {
          this.emit(Clap.actionTypes.SET_RANGE, { range: null });
        }
      });

      this.props.selection.on(() => {
        this.setState({
          selection: this.props.selection.toJSON(),
        });
      });
    }

    this.props.document.on(() => {
      if (this.props.readonly) {
        console.log(this.props.document.toJSON());
      }
      this.setState({
        document: this.props.document.toJSON(),
      });
    });
  }

  public componentDidUpdate(prevProps: EditorProps, prevState: EditorState) {
    this.mapRefToDOMNode();

    if (this.state.selection.mode === 'select') {
      // FYI: Safari keeps focus on contenteditable element when segue to select mode from insert mode.
      if (this.ref.document.current !== window.document.activeElement) {
        (window.document.activeElement as any).blur();
      }
      this.ref.document.current.focus();
    } else if (
      (this.state.selection.mode === 'insert' && prevState.selection.mode !== 'insert') ||
      this.state.selection.id !== prevState.selection.id
    ) {
      this.focus(this.state.selection);
    }
  }

  private focus(selection: Clap.PureSelection) {
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
    const anchorNode = this.mapping.items[selection.id].contents[selection.range.anchor.id];
    const focusNode = this.mapping.items[selection.id].contents[selection.range.focus.id];
    if (anchorNode && focusNode) {
      range.setStart(anchorNode.childNodes[0] || anchorNode, selection.range.anchor.offset);
      range.setEnd(focusNode.childNodes[0] || focusNode, selection.range.focus.offset);
    }

    const windowSelection: Selection = window.getSelection();
    windowSelection.removeAllRanges();
    windowSelection.addRange(range);
  }

  // EventHandler
  private onFocus() {
    const id = this.props.selection.id ? this.props.selection.id : this.props.document.nodes[0].id;
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
  }

  private renderItems(nodes: Clap.ItemNode[], indent: number = 0, items: JSX.Element[] = []): JSX.Element[] {
    for (const node of nodes) {
      const Component = Clap.ComponentPool.take(node.type);

      if (Component) {
        items.push(
          <Clap.Item key={node.id} indent={indent} node={node}>
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
    const options = {
      readonly: this.props.readonly === true,
    };

    return (
      <>
        <EditorContext.Provider
          value={{
            ref: this.ref,
            mapping: this.mapping,
            emit: this.emit,
            document: this.props.document,
            selection: this.props.selection,
            options,
          }}
        >
          <ResetStyle />
          <Wrapper
            ref={this.ref.document}
            tabIndex={options.readonly ? -1 : 0}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
          >
            {this.renderItems(this.props.document.nodes)}
          </Wrapper>
        </EditorContext.Provider>
      </>
    );
  }
}
