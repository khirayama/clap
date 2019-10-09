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
        text: '1',
      },
      nodes: [
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          attributes: {
            text: '1 - 1',
          },
          nodes: [
            {
              id: uuid(),
              object: 'item',
              type: 'paragraph',
              attributes: {
                text: '1 - 1 - 1',
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
            text: '1 - 2',
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
        text: '2',
      },
      nodes: [
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          attributes: {
            text: '2 - 1',
          },
          nodes: [
            {
              id: uuid(),
              object: 'item',
              type: 'paragraph',
              attributes: {
                text: '2 - 1 - 1',
              },
              nodes: [
                {
                  id: uuid(),
                  object: 'item',
                  type: 'paragraph',
                  attributes: {
                    text: '2 - 1 - 1 - 1',
                  },
                  nodes: [],
                },
                {
                  id: uuid(),
                  object: 'item',
                  type: 'paragraph',
                  attributes: {
                    text: '2 - 1 - 1 - 2',
                  },
                  nodes: [],
                },
              ],
            },
          ],
        },
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          attributes: {
            text: '2 - 2',
          },
          nodes: [],
        },
      ],
    },
  ],
};

window.addEventListener('DOMContentLoaded', () => {
  const documentNode = new Clap.DocumentNode(sampleDocument);
  ReactDOM.render(<Clap.Editor document={documentNode} />, window.document.querySelector('#root'));
});
