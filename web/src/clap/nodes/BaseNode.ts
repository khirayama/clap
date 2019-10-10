import uuid from 'uuid/v4';

import { PureNode, Node, PureItemNode, ItemNode, DocumentNode } from './index';
import { ItemNodePool } from './ItemNodePool';

export interface PureBaseNode {
  id: string;
  object: 'document' | 'item';
  nodes: PureItemNode[];
}

const cache: { [key: string]: Node } = {};

export class BaseNode {
  public id: PureBaseNode['id'];

  public object: PureBaseNode['object'];

  public nodes: ItemNode[];

  public relations: {
    document: string;
    parent: string | null;
    next: string | null;
    prev: string | null;
  };

  private listeners: ((node: Node) => void)[] = [];

  constructor(node: Partial<PureNode>, relations?: BaseNode['relations']) {
    this.id = node ? node.id || uuid() : uuid();
    this.object = node ? node.object : 'item';

    if (this.object === 'document') {
      this.relations = {
        document: this.id,
        parent: null,
        next: null,
        prev: null,
      };
    } else {
      this.relations = relations || {
        document: null,
        parent: null,
        next: null,
        prev: null,
      };
    }

    this.nodes =
      node && node.nodes
        ? node.nodes.map(
            (n: PureNode, i: number): ItemNode => {
              const nextNode = node.nodes[i + 1];
              const prevNode = node.nodes[i - 1];
              const relations = {
                document: this.relations.document,
                parent: this.id,
                next: nextNode ? nextNode.id : null,
                prev: prevNode ? prevNode.id : null,
              };

              const nodeClass = ItemNodePool.take((n as PureItemNode).type);
              return new (nodeClass as any)(n, relations);
            },
          )
        : [];

    cache[this.id] = this;
  }

  public dispatch() {
    for (const listener of this.listeners) {
      listener(this);
    }
    // Propagation
    const parentNode = this.parent();
    if (parentNode) {
      parentNode.dispatch();
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

  public toJSON(): PureNode {
    return {
      id: this.id,
      object: this.object,
      nodes: this.nodes.map(node => node.toJSON()),
    };
  }

  public find(id: string): Node | null {
    if (cache[id]) {
      return cache[id];
    }

    if (this.id === id) {
      return this;
    } else if (this.nodes.length) {
      for (const node of this.nodes) {
        const result = node.find(id);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  public document(): DocumentNode {
    return cache[this.relations.document];
  }

  public parent(): Node | null {
    return cache[this.relations.parent] || null;
  }

  public next(): Node | null {
    return cache[this.relations.next] || null;
  }

  public prev(): Node | null {
    return cache[this.relations.prev] || null;
  }

  public children(): Node[] {
    return this.nodes;
  }

  public after(node: ItemNode): ItemNode {
    const parentNode = this.parent();
    const len = parentNode.nodes.length;
    for (let i = 0; i < len; i += 1) {
      const n = parentNode.nodes[i];
      if (n.id === this.id) {
        const nextNode = n.parent().find(n.relations.next);

        node.relations = {
          document: n.relations.document,
          parent: n.relations.parent,
          next: n.relations.next,
          prev: n.id,
        };
        node.nodes = n.nodes.map(childNode => {
          childNode.relations.parent = node.id;
          return childNode;
        });

        n.relations.next = node.id;
        n.nodes = [];

        if (nextNode) {
          nextNode.relations.prev = node.id;
        }

        parentNode.nodes.splice(i + 1, 0, node);
        break;
      }
    }
    this.dispatch();
    return node;
  }
}
