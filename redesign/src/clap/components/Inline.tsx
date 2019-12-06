import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

export interface InlineProps {
  content: Clap.PureContent;
}

const Wrapper = styled.span``;

export function Inline(props: InlineProps) {
  return <Wrapper>{props.content.text}</Wrapper>;
}
