import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

interface DebugHelperProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  display: inline-block;
  white-space: pre;
  background: rgba(55, 55, 55, 0.93);
  color: #fff;
  font-family: serif;
  max-width: 50%;
  height: 100%;
  overflow: scroll;
  font-size: 0.75rem;

  code {
    position: relative;
    display: inline-block;
    width: 100%;
    padding: 8px;

    label {
      display: inline-block;
      position: absolute;
      top: 0;
      right: 0;
      padding: 4px;
      background: rgba(255, 255, 255, 0.67);
    }
  }

  hr {
    width: 100%;
    border-top: solid 1px #fff;
  }
`;

export function DebugHelper(props: DebugHelperProps) {
  return (
    <Wrapper>
      <code>
        <label>selection</label>
        {JSON.stringify(props.selection, null, 2)}
      </code>
      <hr />
      <code>
        <label>document</label>
        {JSON.stringify(props.document.toJSON(), null, 2)}
      </code>
    </Wrapper>
  );
}
