// import deepEqual from 'fast-deep-equal';
import * as React from 'react';

import * as Clap from '../index';
import { EditorContext } from './EditorContext';

interface ContentsInnerProps {
  node: Clap.PureNode;
  selection: Clap.Selection;
}

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
          let tag = 'span';
          let style: { [key: string]: string } = {};
          let attributes: { [key: string]: string } = {};

          if (!content.marks.length) {
            return <React.Fragment key={content.id}>{content.text}</React.Fragment>;
          }
          for (const mark of content.marks) {
            switch (mark.type) {
              case 'bold': {
                style.fontWeight = 'bold';
                break;
              }
              case 'italic': {
                style.fontStyle = 'italic';
                break;
              }
              case 'code': {
                tag = 'code';
                break;
              }
              case 'strike': {
                style.textDecoration = 'line-through';
                break;
              }
              case 'link': {
                tag = 'a';
                attributes.href = mark.href;
                break;
              }
            }
          }
          return React.createElement(
            tag,
            {
              key: content.id,
              ...attributes,
              style,
            },
            content.text,
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

    this.onKeyUp = this.onKeyUp.bind(this);
  }

  private onKeyUp(): void {
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
      if (
        startElementIndex !== null &&
        endElementIndex !== null &&
        text !== currentNode.contents[startElementIndex].text
      ) {
        this.context.emit(Clap.actionTypes.UPDATE_TEXT, {
          id: currentNode.id,
          contentId: currentNode.contents[startElementIndex].id,
          text,
        });
      }
    }
  }

  public render() {
    return (
      <span
        onKeyUp={this.onKeyUp}
        contentEditable
        suppressContentEditableWarning={true}
        ref={this.context.ref.items[this.props.node.id].contents}
      >
        <ContentsInner node={this.props.node} selection={this.context.selection} />
      </span>
    );
  }
}
