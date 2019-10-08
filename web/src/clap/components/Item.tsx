import * as React from 'react';

import { Cursor } from './Editor';

interface ItemProps {
  indent: number;
  cursorMode: Cursor['mode'];
}

const KEY_CODE = {
  ENTER: 13,
  ESC: 27,
  UP: 38,
  DOWN: 40,
};

export class Item extends React.Component<ItemProps> {
  public render(): JSX.Element {
    const indent = this.props.indent;
    const style = {
      paddingLeft: `${indent * 10}px`,
      background: this.props.cursorMode === 'select' ? 'rgba(45, 170, 219, 0.3)' : '#fff',
    };

    const onFocus = (event: React.FormEvent<HTMLDivElement>) => {
      console.log(event);
      console.log('focus');
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keyCode = event.keyCode;
      console.log(event.type, keyCode);
      if (keyCode === KEY_CODE.ENTER) {
        event.preventDefault();
      }
    };

    const onKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keyCode = event.keyCode;
      console.log(event.type, keyCode);
    };

    const onKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const keyCode = event.keyCode;
      console.log(event.type, keyCode);
    };

    return (
      <div
        contentEditable
        style={style}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
        onKeyUp={onKeyUp}
      >
        {this.props.children}
      </div>
    );
  }
}
