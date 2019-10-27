import * as React from 'react';

import * as Clap from '../index';
import { EditorContext } from './EditorContext';

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
      let startElementIndex = null;
      let endElementIndex = null;
      let contents = '';

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
          contents = childNode.textContent;
        }
        if (targetEndNode === childNode) {
          endElementIndex = i;
        }
      }
      if (startElementIndex === endElementIndex) {
        console.log(contents);
        // TODO: emit contents
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
      </span>
    );
  }
}
