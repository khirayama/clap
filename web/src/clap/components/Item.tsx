import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { EditorContext } from './EditorContext';

export interface ItemProps {
  indent: number;
  node: Clap.ItemNode;
}

export interface ItemWrapperProps {
  indent: number;
  isSelected: boolean;
}

const Wrapper = styled.div`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  padding: 0 0 0 ${(props: ItemWrapperProps) => `${props.indent * 10}px`};
  background: ${(props: ItemWrapperProps) => {
    return props.isSelected ? 'rgba(45, 170, 219, 0.3)' : 'transparent';
  }};
`;

export class Item extends React.Component<ItemProps> {
  public static contextType = EditorContext;

  public context!: React.ContextType<typeof EditorContext>;

  constructor(props: ItemProps) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  private onClick(event: React.MouseEvent<HTMLDivElement>): void {
    // FYI: Basically, `onFocus` is enough, but it is needed for non-text item.
    event.stopPropagation();
    this.context.emit('INSERT_MODE', { id: this.props.node.id });
  }

  private onFocus(event: React.FormEvent<HTMLDivElement>): void {
    event.stopPropagation();
    this.context.emit('INSERT_MODE', { id: this.props.node.id });
  }

  public render(): JSX.Element {
    const node = this.props.node;

    this.context.ref.items[node.id] = {
      item: React.createRef(),
      contents: React.createRef(),
    };

    return (
      <Wrapper
        indent={this.props.indent}
        isSelected={this.context.selection.id === this.props.node.id && this.context.selection.mode === 'select'}
        ref={this.context.ref.items[node.id].item}
        tabIndex={0}
        onClick={this.onClick}
        onFocus={this.onFocus}
      >
        {this.props.children}
      </Wrapper>
    );
  }
}
