import * as Automerge from 'automerge';

import { Inline } from './Inline';

export type SuperItem = {
  id: string;
  indent: Automerge.Counter;
  type: 'heading1' | 'paragraph' | 'horizontal-rule' | null;
  inline: Inline[] | null;
};

// FYI: 新しいItemTypeを加えたら、以下に変更が必要。
// - factory.node
// - transform.turnInto
export type Heading1Item = SuperItem & {
  type: 'heading1';
  inline: Inline[];
};

export type ParagraphItem = SuperItem & {
  type: 'paragraph';
  inline: Inline[];
};

export type HorizontalRuleItem = SuperItem & {
  type: 'horizontal-rule';
  inline: null;
};

export type Item = Heading1Item | ParagraphItem | HorizontalRuleItem;
