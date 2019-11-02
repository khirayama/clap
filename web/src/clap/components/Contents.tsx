// import deepEqual from 'fast-deep-equal';
import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { EditorContext } from './EditorContext';

interface ContentsInnerProps {
  node: Clap.PureNode;
  selection: Clap.Selection;
}

interface StyleProps {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
}

const Wrapper = styled.span`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

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

class ContentsInner extends React.Component<ContentsInnerProps> {
  public shouldComponentUpdate(prevProps: ContentsInnerProps) {
    return !(
      prevProps.selection.range &&
      this.props.selection.range &&
      prevProps.selection.id === this.props.selection.id &&
      prevProps.selection.range.anchor.id === this.props.selection.range.anchor.id &&
      prevProps.selection.range.focus.id === this.props.selection.range.focus.id
    );
  }

  public render() {
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

interface ContentsProps {
  node: Clap.PureNode;
}

export class Contents extends React.Component<ContentsProps> {
  public static contextType = EditorContext;

  public context!: React.ContextType<typeof EditorContext>;

  constructor(props: ContentsProps) {
    super(props);

    this.onInput = this.onInput.bind(this);
  }

  private onInput(): void {
    // TODO: keyPressのときのwindowSelectionが必要かも。keyUpまで待つとTextNodeが消えてしまって、indexが一致しない
    // TODO: keydown / inputのときに正しいindexは取れる。
    // TODO: textContentはinputで取れてるけど、ref[contentId]がない。場合 = ''という感じにしなきゃかかも？
    const windowSelection = window.getSelection();
    const clapSelection = this.context.selection.toJSON();

    if (windowSelection.anchorNode && windowSelection.focusNode) {
      const ref = this.context.ref.items[clapSelection.id].contents;
      const currentNode = this.props.node;
      let startElementIndex = null;
      let endElementIndex = null;
      let text = '';

      for (let i = 0; i < ref.current.childNodes.length; i += 1) {
        const childNode = ref.current.childNodes[i];
        let targetStartNode = windowSelection.anchorNode;
        while (targetStartNode.parentNode && targetStartNode.parentNode !== ref.current) {
          targetStartNode = targetStartNode.parentNode;
        }
        let targetEndNode = windowSelection.focusNode;
        while (targetEndNode.parentNode && targetEndNode.parentNode !== ref.current) {
          targetEndNode = targetEndNode.parentNode;
        }
        if (targetStartNode === childNode) {
          startElementIndex = i;
          text = childNode.textContent;
        }
        if (targetEndNode === childNode) {
          endElementIndex = i;
        }
      }
      const contentId = currentNode.contents[startElementIndex || 0].id;
      console.log('input', text, startElementIndex, endElementIndex);
      console.log((this.context.mapping.items[this.context.selection.id] || {}).contents[contentId]);
      if (text !== currentNode.contents[startElementIndex || 0].text) {
        this.context.emit(Clap.actionTypes.UPDATE_TEXT, {
          id: currentNode.id,
          contentId,
          text,
        });
      }
    }
  }

  public render() {
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        onInput={this.onInput}
        ref={this.context.ref.items[this.props.node.id].contents}
      >
        <ContentsInner node={this.props.node} selection={this.context.selection} />
      </span>
    );
  }
}
