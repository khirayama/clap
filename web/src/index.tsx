import * as React from 'react';
import * as ReactDOM from 'react-dom';

import uuid from 'uuid/v4';

import * as Clap from './clap';

const sampleDocument: Clap.PureDocumentNode = {
  id: uuid(),
  object: 'document',
  nodes: [
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      attributes: {
        text: 'First Paragraph Item',
      },
      nodes: [
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          attributes: {
            text: 'First Paragraph Item - Frist Child',
          },
          nodes: [],
        },
      ],
    },
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      attributes: {
        text: 'Second Paragraph Item',
      },
      nodes: [],
    },
  ],
};

window.addEventListener('DOMContentLoaded', () => {
  const documentNode = new Clap.DocumentNode(sampleDocument);
  ReactDOM.render(<Clap.Editor document={documentNode} />, window.document.querySelector('#root'));
});
