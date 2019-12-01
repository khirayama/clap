import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

export interface ItemProps {
  indent: number;
  node: Clap.PureNode;
  selection: Clap.PureSelection;
  children: React.ReactNode;
}

export interface ItemWrapperProps {
  indent: number;
  isSelected: boolean;
}

const Wrapper = styled.div`
  padding: 0 0 0 ${(props: ItemWrapperProps) => `${props.indent * 10}px`};
  background: ${(props: ItemWrapperProps) => {
    return props.isSelected ? 'rgba(45, 170, 219, 0.3)' : 'transparent';
  }};
`;

export function Item(props: ItemProps) {
  const node = props.node;

  return (
    <Wrapper
      indent={props.indent}
      isSelected={props.selection.ids.indexOf(node.id) !== -1 && props.selection.mode === 'select'}
    >
      {props.children}
    </Wrapper>
  );
}
