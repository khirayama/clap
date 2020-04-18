import { Node, NodeType } from './index';
import { InlineText } from '../inlines/index';

/**
 * ParagraphNode > Node
 */
export class ParagraphNode extends Node {
  constructor(node?: Partial<NodeType>) {
    super(node);

    this.type = 'paragraph';
    if (this.inline && !this.inline.length) {
      this.inline.push(new InlineText());
    }
  }
}
