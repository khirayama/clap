import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../nodes/index';
import { Cursor } from './Editor';

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
  cursor: Cursor;
}

export class Paragraph extends React.Component<ParagraphProps> {
  private ref: React.RefObject<HTMLParagraphElement> = React.createRef();

  public render(): JSX.Element {
    const node = this.props.node;

    return (
      <Wrapper ref={this.ref} contentEditable suppressContentEditableWarning={true}>
        {node.attributes.text}
      </Wrapper>
    );
  }
}
