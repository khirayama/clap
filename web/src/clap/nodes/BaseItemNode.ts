import { PureBaseNode, BaseNode } from './BaseNode';

export interface PureBaseItemNode extends PureBaseNode {
  type: 'paragraph';
}

export class BaseItemNode extends BaseNode {
  public static type: PureBaseItemNode['type'];

  public type: PureBaseItemNode['type'];

  constructor(node?: Partial<PureBaseItemNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.type = (this.constructor as any).type;
  }

  public toJSON(): PureBaseItemNode {
    return {
      ...super.toJSON(),
      type: this.type,
    };
  }
}
