import * as React from 'react';

import * as ClapNode from '../nodes/index';

type LeafElement = HTMLSpanElement | HTMLAnchorElement;

interface ItemTextProps {
  leaves: ClapNode.PureLeaf[];
}

export class ItemText extends React.Component<ItemTextProps> {
  public ref: { self: React.RefObject<HTMLSpanElement> } = { self: React.createRef() };

  constructor(props: ItemTextProps) {
    super(props);

    this.onKeyUp = this.onKeyUp.bind(this);
  }

  private onKeyUp() {
    const selection = window.getSelection();
    let startElementIndex = 0;
    let endElementIndex = 0;

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
        break;
      }
    }
    if (startElementIndex === endElementIndex) {
      const leaf = this.props.leaves[startElementIndex];
      console.log(leaf);
    }
  }

  public render() {
    return (
      <span onKeyUp={this.onKeyUp} contentEditable suppressContentEditableWarning={true} ref={this.ref.self}>
        {this.props.leaves.map(leaf => {
          let tag = 'span';
          let style: any = {};
          let attributes: any = {};

          if (!leaf.marks.length) {
            return <React.Fragment key={leaf.id}>{leaf.text}</React.Fragment>;
          }
          for (const mark of leaf.marks) {
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
              key: leaf.id,
              ...attributes,
              style,
            },
            leaf.text,
          );
        })}
      </span>
    );
  }
}
