import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

export interface InlineProps {
  selection: Clap.PureSelection;
  contents: Clap.PureContent[];
}

const Wrapper = styled.span`
  ${(props: { isInRange: boolean; isClosed: boolean }) => (props.isInRange ? 'background: red' : '')};
  ${(props: { isInRange: boolean; isClosed: boolean }) => (props.isClosed ? 'border-right: solid 1px #aaa' : '')};
`;

export function Inline(props: InlineProps) {
  const contents = props.contents;
  const anchor = props.selection.range.anchor;
  const focus = props.selection.range.focus;
  let isClosed = false;
  let isStarted = false;
  // TODO: selectionを分割するのがよい。aとかを分割したくないから

  return (
    <>
      {contents.map(content => {
        // TODO: Check Japanese Chara
        return content.text.split('').map((chara, i) => {
          isClosed = false;
          if (anchor.id === content.id && focus.id === content.id && anchor.offset === i && focus.offset === i) {
            isClosed = true;
          } else if (
            (anchor.id === content.id && anchor.offset === i) ||
            (focus.id === content.id && focus.offset === i)
          ) {
            isStarted = !isStarted;
          }
          return (
            <Wrapper key={`${content.id}-${i}`} isInRange={isStarted} isClosed={isClosed}>
              {chara}
            </Wrapper>
          );
        });
      })}
    </>
  );
}
