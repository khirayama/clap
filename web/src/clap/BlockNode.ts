import uuid from 'uuid/v4';

import { InlineProperties, InlineNode } from './InlineNode';
import { TextProperties, TextNode } from './TextNode';

export interface BlockProperties {
  id: string;
  object: 'block';
  type: 'paragraph';
  nodes: (BlockProperties | InlineProperties | TextProperties)[];
}

export class BlockNode {
  public id: BlockProperties['id'];

  public object: BlockProperties['object'] = 'block';

  public type: BlockProperties['type'];

  public nodes: (BlockNode | InlineNode | TextNode)[];

  constructor(block: Partial<BlockProperties>) {
    this.id = block.id || uuid();
    this.type = block.type;
    this.nodes = block.nodes.map(node => {
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
      id: this.id,
      object: this.object,
      type: this.type,
      nodes: this.nodes.map(node => node.toJSON()),
    };
  }
}
