import * as React from 'react';

import { usecases, BoardHandler, Board } from 'olot';

type PencilProps = {
  userId: string;
  boardHandler: BoardHandler;
};

type PencilState = {
  value: string;
};

const keyCodes = {
  DELETE: 8,
  TAB: 9,
  ENTER: 13,
  LEFT: 37,
  TOP: 38,
  RIGHT: 39,
  DOWN: 40,
};

export class Pencil extends React.Component<PencilProps, PencilState> {
  constructor(props: PencilProps) {
    super(props);

    this.state = {
      value: '',
    };

    this.noop = this.noop.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onCompositionStart = this.onCompositionStart.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCompositionEnd = this.onCompositionEnd.bind(this);
  }

  private noop(): void {
    return;
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    console.log(`${event.type} - ${event.currentTarget.value} - ${event.keyCode}`);
    const keyCode = event.keyCode;
    const metaKey = event.metaKey; // Command
    const ctrlKey = event.ctrlKey; // Ctrl
    const shiftKey = event.shiftKey; // Shift
    const altKey = event.altKey; // Option
    console.log(keyCode, metaKey, ctrlKey, shiftKey, altKey);

    switch (keyCode) {
      case keyCodes.DELETE: {
        this.props.boardHandler.change((board: Board) => {
          usecases(this.props.userId, board).remove();
        });
        break;
      }
      case keyCodes.TAB: {
        event.preventDefault();
        if (shiftKey) {
          this.props.boardHandler.change((board: Board) => {
            console.log('outdent');
            usecases(this.props.userId, board).outdent();
          });
        } else {
          this.props.boardHandler.change((board: Board) => {
            console.log('indent');
            usecases(this.props.userId, board).indent();
          });
        }
        break;
      }
      case keyCodes.ENTER: {
        this.props.boardHandler.change((board: Board) => {
          usecases(this.props.userId, board).enter();
        });
        break;
      }
      case keyCodes.LEFT: {
        // move to left
        break;
      }
      case keyCodes.RIGHT: {
        // move to right
        break;
      }
    }
  }

  private onCompositionStart() {
    this.noop();
  }

  private onChange(event: React.FormEvent<HTMLInputElement>): void {
    const value = event.currentTarget.value;

    this.props.boardHandler.change((board: Board) => {
      usecases(this.props.userId, board).input([value]);
    });
  }

  private onCompositionEnd(): void {
    this.noop();
  }

  public render(): JSX.Element {
    return (
      <input
        autoFocus
        type="text"
        value={this.state.value}
        onKeyDown={this.onKeyDown}
        onCompositionStart={this.onCompositionStart}
        onInput={this.noop}
        onChange={this.onChange}
        onKeyPress={this.noop}
        onCompositionEnd={this.onCompositionEnd}
        onKeyUp={this.noop}
      />
    );
  }
}
