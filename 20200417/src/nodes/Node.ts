import uuid from 'uuid';

type InlineType = ReturnType<Inline['toJSON']>;

abstract class Inline {
  public id: string;

  public type: 'text' | 'link' = 'text';

  public parent: DocumentNode | ItemNode | null = null;

  public next: Inline | null = null;

  public prev: Inline | null = null;

  constructor(inline?: Partial<InlineType>) {
    this.id = uuid.v4();
    this.type = inline ? inline.type || this.type : this.type;
  }

  public toJSON() {
    return {
      id: this.id,
      type: this.type,
    };
  }
}

class InlineText extends Inline {}

class InlineLink extends Inline {}

const inlineMap = {
  text: InlineText,
  link: InlineLink,
};

/**
 * Node
 * private listeners
 * public id
 * public object
 * public type
 * public nodes
 * public inline
 * public document
 * public parent
 * public next
 * public prev
 * public dispatch()
 * public on()
 * public off()
 * public isDocumentNode()
 * public isItemNode()
 * public toJSON()
 */
type NodeType = ReturnType<Node['toJSON']>;

export abstract class Node {
  private listeners: ((node: Node) => void)[] = [];

  public id: string;

  public object: 'document' | 'item' = 'item';

  public type: 'paragraph' = 'paragraph';

  public inline: Inline[] | null = [new InlineText()];

  public nodes: ItemNode[] | null = [];

  public document: DocumentNode | null = null;

  public parent: DocumentNode | ItemNode | null = null;

  public next: ItemNode | null = null;

  public prev: ItemNode | null = null;

  constructor(node?: Partial<NodeType>) {
    this.id = node ? node.id || uuid.v4() : uuid.v4();
    this.object = node ? node.object || this.object : this.object;
    this.type = node ? node.type || this.type : this.type;

    if (this.isDocumentNode()) {
      this.document = this;
    }

    if (node && node.nodes) {
      this.nodes = [];
      for (let i = 0; i < node.nodes.length; i += 1) {
        const n = node.nodes[i];

        const NodeClass = nodeMap[n.type];
        const childNode: Node = new NodeClass(n);

        childNode.document = this.document;
        childNode.parent = this;

        const prevNode = this.nodes[i - 1] || null;
        if (prevNode) {
          childNode.prev = prevNode;
          prevNode.next = childNode;
        }

        this.nodes.push(childNode);
      }
    } else {
      this.nodes = null;
    }

    if (node && node.inline) {
      this.inline = [];
      for (let j = 0; j < node.inline.length; j += 1) {
        const il = node.inline[j];

        const InlineClass = inlineMap[il.type];
        const inline: Inline = new InlineClass(il);

        inline.parent = this;

        const prevInline = this.inline[j - 1] || null;
        if (prevInline) {
          inline.prev = prevInline;
          prevInline.next = inline;
        }

        this.inline.push(inline);
      }
    } else {
      this.inline = null;
    }
  }

  public dispatch() {
    for (const listener of this.listeners) {
      listener(this);
    }
    // Propagation
    if (this.parent) {
      this.parent.dispatch();
    }
  }

  public on(listener: (node: Node) => void) {
    this.listeners.push(listener);
  }

  public off(listener: (node: Node) => void) {
    for (let i = 0; i < this.listeners.length; i += 1) {
      if (this.listeners[i] === listener) {
        this.listeners.splice(0, 1);
        break;
      }
    }
  }

  public isDocumentNode(): this is DocumentNode {
    return this.object === 'document';
  }

  public isItemNode(): this is ItemNode {
    return this.object === 'item';
  }

  public toJSON(): {
    id: Node['id'];
    object: Node['object'];
    type: Node['type'];
    inline: ReturnType<Inline['toJSON']>[] | null;
    nodes: ReturnType<Node['toJSON']>[] | null;
  } {
    return {
      id: this.id,
      object: this.object,
      type: this.type,
      inline: this.inline ? this.inline.map((inline) => inline.toJSON()) : null,
      nodes: this.nodes ? this.nodes.map((node) => node.toJSON()) : null,
    };
  }
}

class DocumentNode extends Node {}

type ItemNode = ParagraphNode;

class ParagraphNode extends Node {}

const nodeMap = {
  document: DocumentNode,
  paragraph: ParagraphNode,
};
