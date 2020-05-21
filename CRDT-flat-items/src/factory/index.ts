// Automerge, traversal
import * as Automerge from 'automerge';

import { Document, ParagraphItem, Heading1Item, HorizontalRuleItem, InlineText, Selection, Range } from '../structures';

export const factory = {
  uuid: () => {
    return Automerge.uuid();
  },

  selection: {
    create: (): Selection => {
      return {
        isComposing: false,
        compositionText: '',
        anchor: null,
        focus: null,
        range: null,
      };
    },
  },

  range: {
    create: (anchorId: string, anchorOffset: number, focusId?: string, focusOffset?: number): Range => {
      return {
        anchor: {
          id: anchorId,
          offset: new Automerge.Counter(anchorOffset),
        },
        focus: {
          id: focusId ? focusId : anchorId,
          offset: new Automerge.Counter(focusOffset !== undefined ? focusOffset : anchorOffset),
        },
      };
    },
  },

  document: {
    create: (): Document => {
      return {
        id: factory.uuid(),
        meta: {
          title: [],
        },
        item: null,
      };
    },
  },

  item: {
    createParagraph: (): ParagraphItem => {
      return {
        id: factory.uuid(),
        type: 'paragraph',
        indent: new Automerge.Counter(0),
        prev: null,
        next: null,
        inline: [],
      };
    },

    createHeading1: (): Heading1Item => {
      return {
        id: factory.uuid(),
        type: 'heading1',
        indent: new Automerge.Counter(0),
        prev: null,
        next: null,
        inline: [],
      };
    },

    createHorizontalRule: (): HorizontalRuleItem => {
      return {
        id: factory.uuid(),
        type: 'horizontal-rule',
        indent: new Automerge.Counter(0),
        prev: null,
        next: null,
        inline: null,
      };
    },
  },

  inline: {
    createInlineText: (): InlineText => {
      return {
        id: factory.uuid(),
        type: 'text',
        parent: null,
        text: [],
        marks: [],
      };
    },
  },
};
