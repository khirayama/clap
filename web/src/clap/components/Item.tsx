import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { keyBinder, Command } from './keyBinds';
import { focus } from './utils';

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
  public ref: { self: React.RefObject<HTMLParagraphElement> } = { self: React.createRef() };

  public render(): JSX.Element {
    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      // TODO: Usecase
      this.props.selection.id = this.props.node.id;
      this.props.selection.mode = 'insert';
      this.props.selection.dispatch();
    };

    const onFocus = (event: React.FormEvent<HTMLDivElement>) => {
      event.stopPropagation();
      // TODO: Usecase
      this.props.selection.id = this.props.node.id;
      this.props.selection.mode = 'insert';
      this.props.selection.dispatch();
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const selection = this.props.selection;
      const mode = selection.mode;
      const currentNode = this.props.node.document().find(selection.id);

      const keyMap = {
        mode,
        keyCode: event.keyCode,
        meta: event.metaKey,
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
      };
      const command = keyBinder.getCommand(keyMap, event);

      if (command !== null) {
        event.preventDefault();
      }

      switch (true) {
        // TODO: Usecase
        case command === Command.SELECT: {
          this.props.selection.mode = 'select';
          this.props.selection.dispatch();
          break;
        }
        // TODO: Usecase
        case command === Command.ADD_AFTER: {
          const node = new Clap.ParagraphNode();
          currentNode.after(node);
          this.props.selection.id = node.id;
          this.props.selection.mode = 'insert';
          this.props.selection.dispatch();
          // TODO: Next item
          // TODO: Solve this problem by creating focusFromSelection function
          focus(this.ref.self.current, 'beginning');
          break;
        }
      }
    };

    return (
      <Wrapper
        ref={this.ref.self}
        tabIndex={0}
        indent={this.props.indent}
        selection={this.props.selection}
        node={this.props.node}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      >
        {this.props.children}
      </Wrapper>
    );
  }
}
