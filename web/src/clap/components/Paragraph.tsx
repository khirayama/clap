import * as React from 'react';
import styled from 'styled-components';

import * as ClapNode from '../nodes/index';
import { Cursor } from './Editor';

const Wrapper = styled.p`
  box-sizing: border-box;
  margin: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  vertical-align: baseline;
  -webkit-appearance: none;

  min-height: 1em;
`;

interface ParagraphProps {
  node: ClapNode.PureParagraphNode;
  cursor: Cursor;
}

type LeafElement = HTMLSpanElement | HTMLAnchorElement;

export class Paragraph extends React.Component<ParagraphProps> {
  public focusable: boolean = true;

  public ref: React.RefObject<HTMLParagraphElement> = React.createRef();

  private leafRefs: { [key: string]: React.RefObject<LeafElement> } = {};

  constructor(props: ParagraphProps) {
    super(props);

    this.onKeyUp = this.onKeyUp.bind(this);
  }

  private onKeyUp() {
    const selection = window.getSelection();
    let startElementIndex = 0;
    let endElementIndex = 0;
    for (let i = 0; i < this.ref.current.childNodes.length; i += 1) {
      const childNode = this.ref.current.childNodes[i];
      let targetStartNode = selection.anchorNode;
      while (targetStartNode.parentNode && targetStartNode.parentNode !== this.ref.current) {
        targetStartNode = targetStartNode.parentNode;
      }
      let targetEndNode = selection.focusNode;
      while (targetEndNode.parentNode && targetEndNode.parentNode !== this.ref.current) {
        targetEndNode = targetEndNode.parentNode;
      }
      if (targetStartNode === childNode) {
        startElementIndex = i;
      }
      if (targetEndNode === childNode) {
        endElementIndex = i;
      }
    }
    console.log(startElementIndex, endElementIndex);
  }

  public renderLeaves(): JSX.Element[] {
    return this.props.node.leaves.map(leaf => {
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
      const ref = React.createRef<LeafElement>();
      this.leafRefs[leaf.id] = ref;
      return React.createElement(
        tag,
        {
          key: leaf.id,
          ...attributes,
          style,
          ref,
          'data-id': leaf.id,
        },
        leaf.text,
      );
    });
  }

  public render(): JSX.Element {
    return (
      <Wrapper ref={this.ref} contentEditable suppressContentEditableWarning={true} onKeyUp={this.onKeyUp}>
        {this.renderLeaves()}
      </Wrapper>
    );
  }
}
