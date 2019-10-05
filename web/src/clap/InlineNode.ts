import { TextProperties, TextNode } from './TextNode';

export interface InlineProperties {
  object: 'inline';
  nodes: (InlineProperties | TextProperties)[];
}

export class InlineNode {
  public object: InlineProperties['object'];

  public nodes: (InlineNode | TextNode)[];

  constructor(inline: InlineProperties) {
    this.object = inline.object;
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
      object: this.object,
      nodes: this.nodes.map((node) => node.toJSON()),
    };
  }
}
