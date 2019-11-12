import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../../index';

const Wrapper = styled.p`
  min-height: 1em;
`;

interface ParagraphProps {
  node: Clap.ItemNode;
}

export class Paragraph extends React.Component<ParagraphProps> {
  public render(): JSX.Element {
    return (
      <Wrapper>
        <Clap.Contents node={this.props.node} key={this.props.node.id} />
      </Wrapper>
    );
  }
}
