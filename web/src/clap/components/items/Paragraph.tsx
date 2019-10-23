import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../../index';

const Wrapper = styled.p`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  min-height: 1em;
`;

interface ParagraphProps {
  node: Clap.PureNode;
  emit: Clap.Editor['emit'];
}

export class Paragraph extends React.Component<ParagraphProps> {
  public render(): JSX.Element {
    return (
      <Wrapper>
        <Clap.ItemText contents={this.props.node.contents} />
      </Wrapper>
    );
  }
}
