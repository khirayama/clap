import { InlineProperties, InlineNode } from './InlineNode';
import { TextProperties, TextNode } from './TextNode';

export interface BlockProperties {
  object: 'block';
  type: 'paragraph';
  nodes: (BlockProperties | InlineProperties | TextProperties)[];
}

export class BlockNode {
  public object: BlockProperties['object'];

  public type: BlockProperties['type'];

  public nodes: (BlockNode | InlineNode |  TextNode)[];

  constructor(block: BlockProperties) {
    this.object = block.object;
    this.type = block.type;
    this.nodes = block.nodes.map((node) => {
      switch (node.object) {
        case 'block': {
          return new BlockNode(node);
        }
        case 'inline': {
          return new InlineNode(node);
        }
        case 'text': {
          return new TextNode(node);
        }
      }
    });
  }

  public toJSON(): BlockProperties {
    return {
      object: this.object,
      type: this.type,
      nodes: this.nodes.map((node) => node.toJSON()),
    }
  }
}
