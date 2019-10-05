// https://docs.slatejs.org/guides/data-model
export interface LeafProperties {
  object: 'leaf';
  text: string;
  marks: ('bold' | 'italic' | 'code')[];
}

export interface TextProperties {
  object: 'text';
  leaves: LeafProperties[];
}

export interface InlineProperties {
  object: 'inline';
  nodes: (InlineProperties | TextProperties)[];
}

export interface BlockProperties {
  object: 'block';
  type: 'paragraph';
  nodes: (BlockProperties | InlineProperties | TextProperties)[];
}

export interface DocumentProperties {
  object: 'document';
  nodes: BlockProperties[];
}

// classes
export class Leaf {
  public object: LeafProperties['object'];

  public text: LeafProperties['text'];

  public marks: LeafProperties['marks'];

  constructor(leaf: LeafProperties) {
    this.object = leaf.object;
    this.text = leaf.text;
    this.marks = leaf.marks;
  }

  public toJSON(): LeafProperties {
    return {
      object: this.object,
      text: this.text,
      marks: this.marks,
    };
  }
}

export class TextNode {
  public object: TextProperties['object'];

  public leaves: Leaf[];

  constructor(text: TextProperties) {
    this.object = text.object;
    this.leaves = text.leaves.map((leaf) => {
      return new Leaf(leaf);
    });
  }

  public toJSON(): TextProperties {
    return {
      object: this.object,
      leaves: this.leaves.map((leaf) => leaf.toJSON()),
    };
  }
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
