import * as React from 'react';
import styled from 'styled-components';

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

const Wrapper = styled.div`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  padding: 0 0 0 ${(props: ItemProps) => `${props.indent * 10}px`};
  background: ${(props: ItemProps) => (props.cursorMode === 'select' ? 'rgba(45, 170, 219, 0.3)' : 'transparent')};

  &:focus {
    background: red;
  }
`;

export class Item extends React.Component<ItemProps> {
  public render(): JSX.Element {
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
      <Wrapper
        tabIndex={0}
        indent={this.props.indent}
        cursorMode={this.props.cursorMode}
        contentEditable={this.props.cursorMode === 'insert'}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
        onKeyUp={onKeyUp}
      >
        {this.props.children}
      </Wrapper>
    );
  }
}
