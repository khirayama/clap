import { PureNode } from './index';
import { PureBaseNode, BaseNode } from './BaseNode';

export interface PureBaseItemNode<T = {}> extends PureBaseNode {
  type: 'paragraph';
  attributes: T;
}

export class BaseItemNode<T = {}> extends BaseNode {
  public static type: PureBaseItemNode['type'];

  public type: PureBaseItemNode['type'];

  public attributes: T;

  constructor(node: PureNode, relations: BaseNode['relations']) {
    super(node, relations);

    this.type = (this.constructor as any).type;
  }

  public toJSON(): PureBaseItemNode<T> {
    return {
      ...super.toJSON(),
      type: this.type,
      attributes: this.attributes,
    };
  }
}
