import { ItemNode } from '../index';
import { ClassPool } from '../ClassPool';
import { PureNode, BaseNode } from '../BaseNode';
import { ParagraphNode } from '../item/ParagraphNode';
import { HorizontalRuleNode } from '../item/HorizontalRuleNode';

interface CustomItemNode {
  key: string;
  nodeClass: { new (): any };
}

export class DocumentNode extends BaseNode {
  public itemNodePool: ClassPool<ItemNode>;

  constructor(node?: Partial<PureNode>, customItemNodes: CustomItemNode[] = []) {
    super(node);

    this.object = 'document';
    this.type = 'document';
    this.contents = null;

    this.itemNodePool = new ClassPool<ItemNode>();
    this.itemNodePool.register('paragraph', ParagraphNode);
    this.itemNodePool.register('horizontal-rule', HorizontalRuleNode);
    if (customItemNodes) {
      customItemNodes.forEach((customItemNode: CustomItemNode) => {
        this.itemNodePool.register(customItemNode.key, customItemNode.nodeClass);
      });
    }
  }
}
