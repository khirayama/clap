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

  private relations: {
    document: string;
    parent: string | null;
    next: string | null;
    prev: string | null;
  };

  constructor(node: PureNode, relations?: BaseNode['relations']) {
    this.id = node.id || uuid();
    this.object = node.object;

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

    this.nodes = node.nodes.map(
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
    );

    cache[this.id] = this;
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
}
