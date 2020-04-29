import * as Automerge from 'automerge';

import { DocumentNode, ParagraphNode } from './node';
import { InlineText } from './inline';
import { Selection } from './selection';

export const factory = {
  selection: {
    createSelection: (): Selection => {
      return {
        isComposing: false,
        compositionText: '',
        ids: [],
        range: null,
      };
    },
  },

  node: {
    createDocumentNode: (): DocumentNode => {
      const doc: DocumentNode = {
        id: Automerge.uuid(),
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
        id: Automerge.uuid(),
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
  },

  inline: {
    createInlineText: (): InlineText => {
      return {
        id: Automerge.uuid(),
        type: 'text',
        text: [],
        marks: [],
      };
    },
  },
};
