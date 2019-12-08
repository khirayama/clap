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
  background: ${(props: ItemWrapperProps) => {
    return props.isSelected ? 'rgba(45, 170, 219, 0.3)' : 'transparent';
  }};

  & & {
    padding: 0 0 0 10px;
  }
`;

export function Item(props: ItemProps) {
  return (
    <Wrapper isSelected={props.selection.ids.indexOf(props.node.id) !== -1 && props.selection.mode === 'select'}>
      {props.node.contents
        ? props.node.contents.map((content: Clap.PureContent) => <Clap.Inline key={content.id} content={content} />)
        : null}
      {props.node.nodes.map(node => (
        <Item key={node.id} node={node} selection={props.selection} />
      ))}
    </Wrapper>
  );
}
