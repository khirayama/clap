import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
`;

interface PencilProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

interface PencilState {
  value: string;
}

/* FYI ******************************************
 * Inputting `a`
 *
 * Chrome *****************
 * keydown  |   | 65
 * keypress |   | 0
 * input    | a | undefined
 * change   | a | undefined
 * keyup    | a | 65
 *
 * Firefox ****************
 * keydown  |   | 65
 * keypress |   | 0
 * input    | a | undefined
 * change   | a | undefined
 * keyup    | a | 65
 *
 * Safari *****************
 * input    | a | undefined
 * change   | a | undefined
 * keydown  | a | 229
 * keyup    | a | 65
 *
 *
 * Inputting `あ` -> Enter
 *
 * Chrome *****************
 * keydown  |    | 229
 * compositionstart
 * input    | あ | undefined
 * change   | あ | undefined
 * keyup    | あ | 65
 *
 * keydown  | あ | 229
 * input    | あ | undefined
 * compositionend
 * keyup    | あ | 13
 *
 * Firefox ****************
 * keydown  |    | 229
 * compositionstart
 * input    | あ | undefined
 * change   | あ | undefined
 * keyup    | あ | 65
 *
 * keydown  | あ | 229
 * input    | あ | undefined
 * compositionend
 * keyup    | あ | 13
 *
 * Safari *****************
 * compositionstart
 * input    | あ | undefined
 * change   | あ | undefined
 * keydown  | あ | 229
 * keyup    | あ | 65
 *
 * input    |    | undefined
 * change   |    | undefined
 * input    | あ | undefined
 * change   | あ | undefined
 * compositionend
 * keydown  | あ | 229
 * keyup    | あ | 13
 *
 * ----------------------------------------------------------------------- *
 * keypress and keydown should not be used with contenteditable.
 * `input - keyup` flow is clear on any browser without IE. And when input event, textContent was updated.
 * When user keeps to push `a`, skip only `keyup` event on Chrome
 * ----------------------------------------------------------------------- *
 * Ref: [JavaScript とクロスブラウザでの IME event handling (2017年) - たにしきんぐダム](https://tanishiking24.hatenablog.com/entry/ime-event-handling-javascript)
 ************************************************/

export class Pencil extends React.Component<PencilProps, PencilState> {
  private tmp: {
    isComposing: boolean;
  } = {
    isComposing: false,
  };

  private operator: Clap.ClientOperator;

  constructor(props: PencilProps) {
    super(props);

    this.state = {
      value: '',
    };

    this.operator = new Clap.ClientOperator(props.document, props.selection);
    this.noop = this.noop.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onCompositionStart = this.onCompositionStart.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCompositionEnd = this.onCompositionEnd.bind(this);
  }

  public render(): JSX.Element {
    return (
      <Wrapper>
        <input
          autoFocus
          value={this.state.value}
          onKeyDown={this.onKeyDown}
          onCompositionStart={this.onCompositionStart}
          onInput={this.noop}
          onChange={this.onChange}
          onKeyPress={this.noop}
          onCompositionEnd={this.onCompositionEnd}
          onKeyUp={this.noop}
        />
      </Wrapper>
    );
  }

  private noop(): void {
    return;
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    // TODO: keyCode controll in KeyDown
    console.log(`${event.type} - ${event.currentTarget.value} - ${event.keyCode}`);
  }

  private onChange(event: React.FormEvent<HTMLInputElement>): void {
    const selection = this.props.selection;

    const value = event.currentTarget.value;
    if (selection.isComposing) {
      this.setState({ value });
    } else {
      this.setState({ value: '' });
    }
    this.applyView(value);
  }

  private onCompositionStart() {
    const selection = this.props.selection;
    selection.isComposing = true;
  }

  private onCompositionEnd(event: React.CompositionEvent<HTMLInputElement>) {
    const selection = this.props.selection;
    selection.isComposing = false;
    selection.compositionText = '';

    const value = event.currentTarget.value;
    this.setState({ value: '' });
    this.applyView(value);
  }

  private applyView(value: string) {
    const document = this.props.document;
    const selection = this.props.selection;

    if (selection.isCollasped()) {
      const node = document.find(selection.ids[0]);
      const content = node.findContent(selection.range.anchor.id);

      const changeset = new Clap.Changeset(document);
      const itemMutation = changeset.findItemMutation(node.id);
      const contentMutation = itemMutation.contentMutations.filter(cm => cm.id === content.id)[0] || null;
      contentMutation.textMutations.unshift({
        type: 'insert',
        value,
      });
      this.operator.emit(changeset);

      // const textArray = content.text.split('');
      // if (!selection.isComposing) {
      //   textArray.splice(selection.range.anchor.offset, retain, value);
      //   selection.range.anchor.offset = selection.range.anchor.offset + value.length;
      //   selection.range.focus.offset = selection.range.focus.offset + value.length;
      //   content.text = textArray.join('');
      //   selection.dispatch();
      //   node.dispatch();
      // } else {
      //   selection.compositionText = value;
      //   selection.dispatch();
      // }
    }
  }
}
