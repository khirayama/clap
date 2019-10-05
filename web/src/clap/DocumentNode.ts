import { BlockProperties, BlockNode } from './BlockNode';

export interface DocumentProperties {
  object: 'document';
  nodes: BlockProperties[];
}

export class DocumentNode {
  public object: DocumentProperties['object'];

  public nodes: BlockNode[];

  constructor(doc: DocumentProperties) {
    this.object = doc.object;
    this.nodes = doc.nodes.map((node) => {
      return new BlockNode(node);
    });
  }

  public toJSON(): DocumentProperties {
    return {
      object: this.object,
      nodes: this.nodes.map((node) => node.toJSON()),
    };
  }
}
