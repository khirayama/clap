import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

interface ContentsInnerProps {
  node: Clap.PureNode;
  selection: Clap.Selection;
  readonly: boolean;
}

interface StyleProps {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
}

interface ContentsInnerState {
  hasError: boolean;
}

const Wrapper = styled.span`
  display: inline; /* FYI: It's for cmd + left/right to jump. If inline-block, it is stopped with a element */

  ${(props: StyleProps) => (props.bold ? 'font-weight: bold;' : '')}
  ${(props: StyleProps) => (props.italic ? 'font-style: italic' : '')}
  ${(props: StyleProps) => (props.code ? 'background: #aaa;' : '')}
  ${(props: StyleProps) => (props.strike ? 'text-decoration: line-through;' : '')}

  &:empty {
    display: inline-block;

    &:before {
      display: inline-block;
      content: 'clap!';
      visibility: hidden;
    }
  }
`;

export class ContentsInner extends React.Component<ContentsInnerProps, ContentsInnerState> {
  constructor(props: ContentsInnerProps) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  public shouldComponentUpdate(prevProps: ContentsInnerProps) {
    if (this.props.readonly) {
      return true;
    }
    const shouldNotUpdate =
      prevProps.selection.range &&
      this.props.selection.range &&
      prevProps.selection.id === this.props.selection.id &&
      prevProps.selection.range.anchor.id === this.props.selection.range.anchor.id &&
      prevProps.selection.range.focus.id === this.props.selection.range.focus.id;
    return !shouldNotUpdate;
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.log(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <>Something wrong</>;
    }

    return (
      <>
        {this.props.node.contents.map(content => {
          const styleProps: StyleProps = {};
          for (const mark of content.marks) {
            switch (mark.type) {
              case 'bold': {
                styleProps.bold = true;
                break;
              }
              case 'italic': {
                styleProps.italic = true;
                break;
              }
              case 'code': {
                styleProps.code = true;
                break;
              }
              case 'strike': {
                styleProps.strike = true;
                break;
              }
              // TODO: Support link
            }
          }
          return (
            <Wrapper key={content.id} {...styleProps}>
              {content.text}
            </Wrapper>
          );
        })}
      </>
    );
  }
}
