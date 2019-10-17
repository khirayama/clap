import { PureBaseNode, BaseNode } from './BaseNode';
import { TextContent } from './TextContent';
import { PureContent, Content } from './index';

export interface PureBaseItemNode extends PureBaseNode {
  type: 'paragraph' | 'horizontal-rule';
  contents: PureContent[] | null;
}

export class BaseItemNode extends BaseNode {
  public type: PureBaseItemNode['type'];

  public contents: Content[] | null = [];

  constructor(node?: Partial<PureBaseItemNode>, relations?: BaseNode['relations']) {
    super(node, relations);

    this.object = 'item';
    this.contents =
      node && node.contents
        ? node.contents.map((content: PureContent) => {
            // TODO: Need pool
            return new TextContent(content);
          })
        : [];
  }

  public toJSON(): PureBaseItemNode {
    return {
      ...super.toJSON(),
      type: this.type,
      contents: this.contents ? this.contents.map(content => content.toJSON()) : null,
    };
  }
}
