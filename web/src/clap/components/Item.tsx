import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { EditorContext } from './EditorContext';

export interface ItemProps {
  indent: number;
  selection: Clap.Selection;
  node: Clap.ItemNode;
}

const Wrapper = styled.div`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  padding: 0 0 0 ${(props: ItemProps) => `${props.indent * 10}px`};
  background: ${(props: ItemProps) => {
    if (props.selection.id === props.node.id && props.selection.mode === 'select') {
      return 'rgba(45, 170, 219, 0.3)';
    }
    return 'transparent';
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
        ref={this.context.ref.items[node.id].item}
        tabIndex={0}
        indent={this.props.indent}
        selection={this.props.selection}
        node={this.props.node}
        onClick={this.onClick}
        onFocus={this.onFocus}
      >
        {this.props.children}
      </Wrapper>
    );
  }
}
