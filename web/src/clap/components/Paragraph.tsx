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

export class Paragraph extends React.Component<ParagraphProps> {
  private ref: React.RefObject<HTMLParagraphElement> = React.createRef();

  private focus() {
    // FYI: https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
    const el: HTMLParagraphElement = this.ref.current;
    const range: Range = document.createRange();
    /*
    FYI: If you use following lines, it doesn't work. It returns selection start and end are 1.
    Maybe it is react's problem. Raw content editable doesn't have.
    ```
    range.selectNodeContents(el);
    range.collapse(false);
    ```
    */
    range.setStart(el.childNodes[0] || el, el.innerHTML.length);
    range.setEnd(el.childNodes[0] || el, el.innerHTML.length);
    const selection: Selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  public componentDidMount() {
    if (this.props.node.id === this.props.cursor.id && this.props.cursor.mode === 'insert' && this.ref.current) {
      this.focus();
    }
  }

  public componentDidUpdate() {
    if (this.props.node.id === this.props.cursor.id && this.props.cursor.mode === 'insert' && this.ref.current) {
      this.focus();
    }
  }

  public render(): JSX.Element {
    const node = this.props.node;
    // const cursor = this.props.cursor;

    return (
      <Wrapper ref={this.ref} contentEditable suppressContentEditableWarning={true}>
        {node.attributes.text}
      </Wrapper>
    );
  }
}
