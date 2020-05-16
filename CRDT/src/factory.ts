// Automerge/traversal
import * as Automerge from 'automerge';
import { DocumentNode, ParagraphNode, Heading1Node, HorizontalRuleNode } from './node';
import { InlineText } from './inline';
import { Selection, Range } from './selection';

export const factory = {
  uuid: () => {
    return Automerge.uuid();
  },
  selection: {
    createSelection: (): Selection => {
      return {
        isComposing: false,
        compositionText: '',
        anchor: null,
        focus: null,
        range: null,
      };
    },
    createRange: (anchorId: string, anchorOffset: number, focusId?: string, focusOffset?: number): Range => {
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

  node: {
    createDocumentNode: (): DocumentNode => {
      const doc: DocumentNode = {
        id: factory.uuid(),
        object: 'document',
        type: null,
        inline: null,
        nodes: [],
        document: '',
        parent: null,
        prev: null,
        next: null,
        meta: {
          title: [],
        },
      };
      doc.document = doc.id;
      return doc;
    },

    createParagraphNode: (): ParagraphNode => {
      return {
        id: factory.uuid(),
        object: 'item',
        type: 'paragraph',
        document: null,
        parent: null,
        prev: null,
        next: null,
        inline: [],
        nodes: [],
      };
    },

    createHeading1Node: (): Heading1Node => {
      return {
        id: factory.uuid(),
        object: 'item',
        type: 'heading1',
        document: null,
        parent: null,
        prev: null,
        next: null,
        inline: [],
        nodes: null,
      };
    },

    createHorizontalRuleNode: (): HorizontalRuleNode => {
      return {
        id: factory.uuid(),
        object: 'item',
        type: 'horizontal-rule',
        document: null,
        parent: null,
        prev: null,
        next: null,
        inline: null,
        nodes: null,
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
