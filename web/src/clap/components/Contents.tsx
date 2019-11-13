import deepEqual from 'fast-deep-equal';
import * as React from 'react';

import * as Clap from '../index';
import { EditorContext } from './EditorContext';
import { ContentsInner } from './ContentsInner';
import { windowSelectionToClapSelection } from './utils';

/* FYI ******************************************
 * Chrome  : keydown - keypress        - input   - selectionchange - keyup
 * Firefox : keydown - keypress        - input   - selectionchange - keyup
 * Safari  : input   - selectionchange - keydown - keyup
 * ----------------------------------------------------------------------- *
 * keypress and keydown should not be used with contenteditable.
 * input - selectionchange - keyup flow is clear on any browser. And when input event, textContent was updated.
 ************************************************/

interface ContentsProps {
  node: Clap.ItemNode;
}

interface ContentsState {
  node: Clap.PureNode;
}

export class Contents extends React.Component<ContentsProps, ContentsState> {
  public static contextType = EditorContext;

  public context!: React.ContextType<typeof EditorContext>;

  private selectionSnapshot: Clap.PureSelection | null = null;

  constructor(props: ContentsProps) {
    super(props);

    this.state = {
      node: this.props.node.toJSON(),
    };

    this.onInput = this.onInput.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  public componentDidMount() {
    this.props.node.on(() => {
      this.setState({
        node: this.props.node.toJSON(),
      });
    });
  }

  private onInput(): void {
    const windowSelection = window.getSelection();
    const clapSelection = this.context.selection.toJSON();

    this.selectionSnapshot = clapSelection;

    if (windowSelection.anchorNode && windowSelection.focusNode) {
      const ref = this.context.ref.items[clapSelection.id].contents;
      const currentNode = this.state.node;
      let startElementIndex: number | null = null;
      // let endElementIndex: number | null = null;
      let text = '';

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
          text = childNode.textContent;
        }
        // if (targetEndNode === childNode) {
        //   endElementIndex = i;
        // }
      }
      const contentId = currentNode.contents[startElementIndex || 0].id;
      if (text !== currentNode.contents[startElementIndex || 0].text) {
        this.context.emit(Clap.actionTypes.UPDATE_TEXT, {
          id: currentNode.id,
          contentId,
          text,
        });
      }
    }
  }

  private onKeyUp(): void {
    if (
      this.selectionSnapshot &&
      !this.context.mapping.items[this.selectionSnapshot.id].contents[this.selectionSnapshot.range.anchor.id]
    ) {
      this.context.emit(Clap.actionTypes.UPDATE_TEXT, {
        id: this.selectionSnapshot.id,
        contentId: this.selectionSnapshot.range.anchor.id,
        text: '',
      });
    }

    const range = windowSelectionToClapSelection(this.context.document, this.context.selection, this.context.ref);
    const clapSelection = this.context.selection.toJSON();
    if (!deepEqual(range, clapSelection.range)) {
      this.context.emit(Clap.actionTypes.SET_RANGE, { range });
    }
    this.selectionSnapshot = null;
  }

  public render() {
    return (
      <span
        contentEditable={!this.context.options.readonly}
        suppressContentEditableWarning
        onInput={this.onInput}
        onKeyUp={this.onKeyUp}
        ref={this.context.ref.items[this.state.node.id].contents}
      >
        <ContentsInner
          node={this.state.node}
          selection={this.context.selection}
          readonly={this.context.options.readonly}
        />
      </span>
    );
  }
}
