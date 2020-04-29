import { Inline } from './inline';

export type SuperNode = {
  id: string;
  object: 'document' | 'item';
  type: 'paragraph' | null;
  document: string | null;
  parent: string | null;
  prev: string | null;
  next: string | null;
  inline: Inline[] | null;
  nodes: ItemNode[] | null;
};

export type ParagraphNode = SuperNode & {
  object: 'item';
  type: 'paragraph';
  inline: Inline[];
  nodes: ItemNode[];
};

export type ItemNode = ParagraphNode;

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
