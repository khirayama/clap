import { v4 as uuid } from 'uuid';
import { DocumentNode, ParagraphNode, InlineText } from './node';

export const factory = {
  node: {
    createDocumentNode: (): DocumentNode => {
      const doc: DocumentNode = {
        id: uuid(),
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
        id: uuid(),
        object: 'item',
        type: 'paragraph',
        document: null,
        parent: null,
        prev: null,
        next: null,
        inline: [factory.inline.createInlineText()],
        nodes: [],
      };
    },
  },
  inline: {
    createInlineText: (): InlineText => {
      return {
        id: uuid(),
        type: 'text',
        text: [],
        marks: [],
      };
    },
  },
};
