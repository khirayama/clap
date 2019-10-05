import uuid from 'uuid/v4';

import { TextProperties, TextNode } from './TextNode';

export interface InlineProperties {
  id: string;
  object: 'inline';
  nodes: (InlineProperties | TextProperties)[];
}

export class InlineNode {
  public id: InlineProperties['id'];

  public object: InlineProperties['object'] = 'inline';

  public nodes: (InlineNode | TextNode)[];

  constructor(inline: Partial<InlineProperties>) {
    this.id = inline.id || uuid();
    this.nodes = inline.nodes.map((node) => {
      switch (node.object) {
        case 'inline': {
          return new InlineNode(node);
        }
        case 'text': {
          return  new TextNode(node);
        }
      }
    });
  }

  public toJSON(): InlineProperties {
    return {
      id: this.id,
      object: this.object,
      nodes: this.nodes.map((node) => node.toJSON()),
    };
  }
}
