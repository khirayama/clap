import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../../nodes/index';
import { ItemText } from '../../components/index';

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
  node: ClapNode.PureParagraphNode;
}

export class Paragraph extends React.Component<ParagraphProps> {
  public ref: { text: React.RefObject<ItemText> } = { text: React.createRef() };

  public render(): JSX.Element {
    return (
      <Wrapper>
        <ItemText ref={this.ref.text} leaves={this.props.node.leaves} />
      </Wrapper>
    );
  }
}
