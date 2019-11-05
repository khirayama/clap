import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../../nodes/index';

const Wrapper = styled.div`
  padding: 8px 0;
`;

const Hr = styled.hr`
  border-bottom: solid 1px #aaa;
`;

interface HorizontalRuleProps {
  node: ClapNode.PureNode;
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
