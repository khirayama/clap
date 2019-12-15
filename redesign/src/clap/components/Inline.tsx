import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

export interface InlineProps {
  selection: Clap.PureSelection;
  contents: Clap.PureContent[];
}

export interface WrapperProps {
  isInRange: boolean;
  hasCaret: boolean;
}

const Wrapper = styled.span`
  position: relative;
  ${(props: WrapperProps) => (props.isInRange ? 'background: #accef7;' : '')}

  ${(props: WrapperProps) =>
    props.hasCaret
      ? `
    &:before {
      position: absolute;
      top: 0;
      left: 0;
      display: inline-block;
      content: '';
      width: 1px;
      height: 100%;
      background: #333;

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }
      animation: blink 1000ms step-end infinite;
    }
  `
      : ''};
`;

export function Inline(props: InlineProps) {
  const contents = props.contents;
  const anchor = props.selection.range.anchor;
  const focus = props.selection.range.focus;
  let isClosed = anchor.id === focus.id && anchor.offset === focus.offset;
  let isStarted = false;
  // TODO: selectionを分割するのがよい。aとかを分割したくないから

  return (
    <>
      {contents.map(content => {
        // TODO: Check Japanese Chara
        return content.text.split('').map((chara, i) => {
          if (
            !isClosed &&
            ((anchor.id === content.id && anchor.offset === i) || (focus.id === content.id && focus.offset === i))
          ) {
            isStarted = !isStarted;
          }
          return (
            <Wrapper
              key={`${content.id}-${i}`}
              isInRange={isStarted}
              hasCaret={isClosed && anchor.id === content.id && anchor.offset === i}
            >
              {chara}
            </Wrapper>
          );
        });
      })}
    </>
  );
}
