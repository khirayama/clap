import { PureBaseNode, BaseNode } from './BaseNode';

export interface PureBaseItemNode<T = {}> extends PureBaseNode {
  type: 'paragraph';
  attributes: T;
}

export class BaseItemNode<T = {}> extends BaseNode {
  public static type: PureBaseItemNode['type'];

  public type: PureBaseItemNode['type'];

  public attributes: T | { [key: string]: any } = {};

  constructor(node?: Partial<PureBaseItemNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.type = (this.constructor as any).type;
    this.attributes = node ? node.attributes || {} : {};
  }

  public toJSON(): PureBaseItemNode<T | { [key: string]: any }> {
    return {
      ...super.toJSON(),
      type: this.type,
      attributes: this.attributes,
    };
  }
}
