import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../../nodes/index';

const Wrapper = styled.div`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  padding: 8px 0;
`;

const Hr = styled.hr`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  border-bottom: solid 1px #aaa;
`;

interface HorizontalRuleProps {
  node: ClapNode.PureParagraphNode;
}

export class HorizontalRule extends React.Component<HorizontalRuleProps> {
  public render(): JSX.Element {
    return (
      <Wrapper>
        <Hr />
      </Wrapper>
    );
  }
}
