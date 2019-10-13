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
  public focusable: boolean = true;

  public ref: React.RefObject<HTMLParagraphElement> = React.createRef();

  public html(): string {
    return this.props.node.attributes.leaves
      .map(leaf => {
        let style = '';
        let tag = 'span';
        let attributes = [];
        for (const mark of leaf.marks) {
          switch (mark.type) {
            case 'bold': {
              style += 'font-weight: bold;';
              break;
            }
            case 'italic': {
              style += 'font-style: italic;';
              break;
            }
            case 'code': {
              tag = 'code';
              break;
            }
            case 'strike': {
              style += 'text-decoration: line-through;';
              break;
            }
            case 'link': {
              tag = 'a';
              attributes.push(`href="${mark.href}" onclick="window.alert('hey')"`);
              break;
            }
          }
        }
        return `<${tag} style="${style}" ${attributes.join(' ')}>${leaf.text}</${tag}>`;
      })
      .join('');
  }

  public renderLeaves(): JSX.Element[] {
    return this.props.node.attributes.leaves.map(leaf => {
      let tag = 'span';
      let style: any = {};
      let attributes: any = {};
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
    });
  }

  // dangerouslySetInnerHTML={{ __html: this.html() }}
  public render(): JSX.Element {
    return (
      <Wrapper ref={this.ref} contentEditable suppressContentEditableWarning={true}>
        {this.renderLeaves()}
      </Wrapper>
    );
  }
}
