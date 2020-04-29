import * as Automerge from 'automerge';

import { transform } from './transform';
import { DocumentNode, ParagraphNode, InlineText } from './node';
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

  utils: {
    init: (userId: string): { document: DocumentNode; users: { [userId: string]: Selection } } => {
      const selection = factory.selection.createSelection();
      const document = factory.node.createDocumentNode();
      const paragraph = factory.node.createParagraphNode();
      const inlineText = factory.inline.createInlineText();

      paragraph.inline.push(inlineText);
      transform.node.append(document, paragraph);

      selection.ids.push(paragraph.id);
      selection.range = {
        anchor: {
          id: inlineText.id,
          offset: new Automerge.Counter(0),
        },
        focus: {
          id: inlineText.id,
          offset: new Automerge.Counter(0),
        },
      };

      return {
        document,
        users: {
          [userId]: selection,
        },
      };
    },
  },
};
