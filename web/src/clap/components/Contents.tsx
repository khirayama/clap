// import deepEqual from 'fast-deep-equal';
import * as React from 'react';
import styled from 'styled-components';
import deepEqual from 'fast-deep-equal';

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
      prevProps.selection.range.focus.id === this.props.selection.range.focus.id &&
      deepEqual(prevProps.node.contents, this.props.node.contents)
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

  private tmp = {};

  constructor(props: ContentsProps) {
    super(props);

    this.onInput = this.onInput.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  private onInput(): void {
    const windowSelection = window.getSelection();
    const clapSelection = this.context.selection.toJSON();

    if (windowSelection.anchorNode && windowSelection.focusNode) {
      const ref = this.context.ref.items[clapSelection.id].contents;
      const currentNode = this.props.node;
      let startElementIndex: number | null = null;
      // let endElementIndex: number | null = null;
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
        // if (targetEndNode === childNode) {
        //   endElementIndex = i;
        // }
      }
      const contentId = currentNode.contents[startElementIndex || 0].id;
      console.log(`${text} - ${currentNode.contents[startElementIndex || 0].text}`);
      if (text !== currentNode.contents[startElementIndex || 0].text) {
        this.context.emit(Clap.actionTypes.UPDATE_TEXT, {
          id: currentNode.id,
          contentId,
          text,
        });
      }
    }
  }

  private onKeyUp() {
    // TODO: tmpに一連の流れを入れる
    // TODO: tmpをクリア
  }

  public render() {
    return (
      <span
        contentEditable={!this.context.options.readonly}
        suppressContentEditableWarning
        onInput={this.onInput}
        onKeyUp={this.onKeyUp}
        ref={this.context.ref.items[this.props.node.id].contents}
      >
        <ContentsInner node={this.props.node} selection={this.context.selection} />
      </span>
    );
  }
}
