import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

interface DebugHelperProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

const Wrapper = styled.div`
  display: inline-block;
  vertical-align: top;
  white-space: pre;
  background: #666;
  color: #fff;
  font-family: serif;
  width: 50%;
  max-height: 800px;
  overflow: scroll;
  padding: 12px;

  code {
    display: inline-block;
    width: 100%;
  }

  code + code {
    border-top: solid 2px #aaa;
  }
`;

export function DebugHelper(props: DebugHelperProps) {
  return (
    <Wrapper>
      <code>{JSON.stringify(props.selection, null, 2)}</code>
      <code>{JSON.stringify(props.document.toJSON(), null, 2)}</code>
    </Wrapper>
  );
}
