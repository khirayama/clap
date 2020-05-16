import { Inline } from './inline';

export type SuperNode = {
  id: string;
  object: 'document' | 'item';
  type: 'heading1' | 'paragraph' | 'horizontal-rule' | null;
  document: string | null;
  parent: string | null;
  prev: string | null;
  next: string | null;
  inline: Inline[] | null;
  nodes: ItemNode[] | null;
};

// FYI: 新しいNodeTypeを加えたら、以下に変更が必要。
// - factory.node
// - transform.turnInto
export type Heading1Node = SuperNode & {
  object: 'item';
  type: 'heading1';
  inline: Inline[];
  nodes: null;
};

export type ParagraphNode = SuperNode & {
  object: 'item';
  type: 'paragraph';
  inline: Inline[];
  nodes: ItemNode[];
};

export type HorizontalRuleNode = SuperNode & {
  object: 'item';
  type: 'horizontal-rule';
  inline: null;
  nodes: null;
};

export type ItemNode = Heading1Node | ParagraphNode | HorizontalRuleNode;

export type DocumentNode = SuperNode & {
  object: 'document';
  type: null;
  inline: null;
  document: string;
  parent: null;
  prev: null;
  next: null;
  nodes: ItemNode[];
  meta: {
    title: string[];
  };
};
