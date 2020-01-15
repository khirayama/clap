import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

export interface InlineProps {
  selection: Clap.PureSelection;
  contents: Clap.PureContent[];
}

export interface WrapperProps {
  isInRange: boolean;
}

const Caret = styled.span`
  position: absolute;
  display: inline-block;
  width: 1px;
  height: 100%;
  background: #333;

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
  animation: blink 1000ms step-end infinite;
`;

const Wrapper = styled.span`
  position: relative;
  ${(props: WrapperProps) => (props.isInRange ? 'background: #accef7;' : '')}
`;

const CompositionWrapper = styled.span`
  text-decoration: underline;
`;

export function Inline(props: InlineProps) {
  const contents = props.contents;
  const anchor = props.selection.range.anchor;
  const focus = props.selection.range.focus;
  let isStarted = false;
  // TODO: selectionを分割するのがよい。aとかを分割したくないから

  return contents ? (
    <>
      {contents.map(content => {
        const hasCaret = props.selection.isCollasped && anchor.id === content.id;
        return content.text.length ? (
          // TODO: Use https://github.com/orling/grapheme-splitter
          Array.from(content.text).map((chara, i) => {
            if (
              !props.selection.isCollasped &&
              ((anchor.id === content.id && anchor.offset === i) || (focus.id === content.id && focus.offset === i))
            ) {
              isStarted = !isStarted;
            }
            // FYI: &#8203; is zero-width-space. It is for preventing not to display `space`.
            return (
              <span key={`${content.id}-${i}`}>
                <Wrapper isInRange={isStarted}>
                  {anchor.id === content.id && anchor.offset === i ? (
                    <CompositionWrapper>{props.selection.compositionText}</CompositionWrapper>
                  ) : null}
                  {hasCaret && anchor.offset === i ? <Caret /> : null}
                  &#8203;{chara}&#8203;
                  {anchor.id === content.id &&
                  anchor.offset === content.text.length &&
                  content.text.length === i + 1 ? (
                    <CompositionWrapper>{props.selection.compositionText}</CompositionWrapper>
                  ) : null}
                  {hasCaret && anchor.offset === content.text.length && content.text.length === i + 1 ? (
                    <Caret />
                  ) : null}
                </Wrapper>
              </span>
            );
          })
        ) : (
          <span key={`${content.id}-0`}>
            <Wrapper isInRange={false}>
              {hasCaret && anchor.offset === 0 ? <Caret /> : null}
              &#8203;
            </Wrapper>
          </span>
        );
      })}
    </>
  ) : null;
}
