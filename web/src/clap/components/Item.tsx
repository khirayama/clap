import * as React from 'react';
import styled from 'styled-components';

import { Cursor } from './Editor';
import * as ClapNode from '../nodes/index';

export interface ItemProps {
  indent: number;
  cursor: Cursor;
  node: ClapNode.PureItemNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>, props: ItemProps) => void;
  onFocus?: (event: React.FormEvent<HTMLDivElement>, props: ItemProps) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>, props: ItemProps) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLDivElement>, props: ItemProps) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>, props: ItemProps) => void;
}

const Wrapper = styled.div`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  min-height: 1em;
  padding: 0 0 0 ${(props: ItemProps) => `${props.indent * 10}px`};
  background: ${(props: ItemProps) => {
    if (props.cursor.id === props.node.id && props.cursor.mode === 'select') {
      return 'rgba(45, 170, 219, 0.3)';
    } else if (props.cursor.id === props.node.id && props.cursor.mode === 'insert') {
      return 'red';
    }
    return 'transparent';
  }};
`;

export class Item extends React.Component<ItemProps> {
  public render(): JSX.Element {
    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (this.props.onClick) {
        this.props.onClick(event, this.props);
      }
    };

    const onFocus = (event: React.FormEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (this.props.onFocus) {
        this.props.onFocus(event, this.props);
      }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (this.props.onKeyDown) {
        this.props.onKeyDown(event, this.props);
      }
    };

    const onKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (this.props.onKeyPress) {
        this.props.onKeyPress(event, this.props);
      }
    };

    const onKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (this.props.onKeyUp) {
        this.props.onKeyUp(event, this.props);
      }
    };

    return (
      <Wrapper
        tabIndex={0}
        indent={this.props.indent}
        cursor={this.props.cursor}
        node={this.props.node}
        onClick={onClick}
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
