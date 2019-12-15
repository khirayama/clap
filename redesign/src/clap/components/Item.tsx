import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

export interface ItemProps {
  node: Clap.PureNode;
  selection: Clap.PureSelection;
}

export interface ItemWrapperProps {
  isSelected: boolean;
}

const Wrapper = styled.div`
  & & {
    padding: 0 0 0 10px;
  }
`;

const InlineWrapper = styled.div`
  background: ${(props: ItemWrapperProps) => (props.isSelected ? 'rgba(45, 170, 219, 0.3)' : 'transparent')};
`;

export function Item(props: ItemProps) {
  const isSelected = props.selection.ids.indexOf(props.node.id) !== -1 && props.selection.mode === 'select';

  return (
    <Wrapper>
      <InlineWrapper isSelected={isSelected}>
        <Clap.Inline contents={props.node.contents} selection={props.selection} />
      </InlineWrapper>
      {props.node.nodes.map(node => (
        <Item key={node.id} node={node} selection={props.selection} />
      ))}
    </Wrapper>
  );
}
