import * as React from 'react';

import * as Clap from '../index';

interface ItemTextProps {
  emit: Clap.Editor['emit'];
  contents: Clap.PureContent[];
}

export class ItemText extends React.Component<ItemTextProps> {
  public ref: { self: React.RefObject<HTMLSpanElement> } = { self: React.createRef() };

  constructor(props: ItemTextProps) {
    super(props);

    this.onKeyUp = this.onKeyUp.bind(this);
  }

  public componentDidMount() {
    // TODO: まとめないとhandlerの数がヤバイな - EventEmitterでselectionchange.idみたいなの飛ばしてキャッチか。listenersの数が多くなりすぎるかもだけどO(1)だからマシか
    window.document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      let startElementIndex = null;
      let endElementIndex = null;

      for (let i = 0; i < this.ref.self.current.childNodes.length; i += 1) {
        const childNode = this.ref.self.current.childNodes[i];
        let targetStartNode = selection.anchorNode;
        while (targetStartNode.parentNode && targetStartNode.parentNode !== this.ref.self.current) {
          targetStartNode = targetStartNode.parentNode;
        }
        let targetEndNode = selection.focusNode;
        while (targetEndNode.parentNode && targetEndNode.parentNode !== this.ref.self.current) {
          targetEndNode = targetEndNode.parentNode;
        }
        if (targetStartNode === childNode) {
          startElementIndex = i;
        }
        if (targetEndNode === childNode) {
          endElementIndex = i;
        }
      }
      if (startElementIndex !== null && endElementIndex !== null) {
        const anchorContent = this.props.contents[startElementIndex];
        const focusContent = this.props.contents[endElementIndex];
        const range = {
          anchor: {
            id: anchorContent.id,
            offset: selection.anchorOffset,
          },
          focus: {
            id: focusContent.id,
            offset: selection.focusOffset,
          },
        };
        console.log(range);
        // this.props.emit(Clap.actionTypes.SET_RANGE, { range });
      }
    });
  }

  private onKeyUp() {}

  public render() {
    return (
      <span onKeyUp={this.onKeyUp} contentEditable suppressContentEditableWarning={true} ref={this.ref.self}>
        {this.props.contents.map(content => {
          let tag = 'span';
          let style: any = {};
          let attributes: any = {};

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
