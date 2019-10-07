import uuid from 'uuid/v4';

import { PureNode, PureItemNode, ItemNode } from './index';
import { ItemPool } from './ItemPool';

export interface PureBaseNode {
  id: string;
  object: 'document' | 'item';
  nodes: PureItemNode[];
}

export class BaseNode {
  public id: PureBaseNode['id'];

  public object: PureBaseNode['object'];

  public nodes: ItemNode[];

  constructor(node: PureNode) {
    this.id = node.id || uuid();
    this.object = node.object;
    this.nodes = node.nodes.map(
      (n: PureNode): ItemNode => {
        const classObject = ItemPool.take((n as PureItemNode).type);
        return new (classObject as any)(n);
      },
    );
  }

  public toJSON(): PureNode {
    return {
      id: this.id,
      object: this.object,
      nodes: this.nodes.map(node => node.toJSON()),
    };
  }
}
