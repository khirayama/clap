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
      leaves: [
        {
          id: uuid(),
          text: '1',
          marks: [],
        },
      ],
      nodes: [
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          leaves: [
            {
              id: uuid(),
              text: '1 - 1',
              marks: [
                {
                  type: 'bold',
                },
              ],
            },
          ],
          nodes: [
            {
              id: uuid(),
              object: 'item',
              type: 'paragraph',
              leaves: [
                {
                  id: uuid(),
                  text: '1 - ',
                  marks: [
                    {
                      type: 'italic',
                    },
                  ],
                },
                {
                  id: uuid(),
                  text: '1 -',
                  marks: [
                    {
                      type: 'bold',
                    },
                  ],
                },
                {
                  id: uuid(),
                  text: '1',
                  marks: [],
                },
              ],
              nodes: [],
            },
          ],
        },
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          leaves: [
            {
              id: uuid(),
              text: '1 - 2',
              marks: [
                {
                  type: 'code',
                },
              ],
            },
          ],
          nodes: [],
        },
      ],
    },
    {
      id: uuid(),
      object: 'item',
      type: 'horizontal-rule',
      leaves: [],
      nodes: [],
    },
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      leaves: [
        {
          id: uuid(),
          text: '2',
          marks: [
            {
              type: 'bold',
            },
            {
              type: 'italic',
            },
          ],
        },
      ],
      nodes: [
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          leaves: [
            {
              id: uuid(),
              text: '2 - 1',
              marks: [
                {
                  type: 'link',
                  href: 'https://www.google.com',
                },
              ],
            },
          ],
          nodes: [
            {
              id: uuid(),
              object: 'item',
              type: 'paragraph',
              leaves: [
                {
                  id: uuid(),
                  text: '2 - 1 - 1',
                  marks: [],
                },
              ],
              nodes: [
                {
                  id: uuid(),
                  object: 'item',
                  type: 'paragraph',
                  leaves: [
                    {
                      id: uuid(),
                      text: '2 - 1 - 1 - 1',
                      marks: [],
                    },
                  ],
                  nodes: [],
                },
                {
                  id: uuid(),
                  object: 'item',
                  type: 'paragraph',
                  leaves: [
                    {
                      id: uuid(),
                      text: '2 - 1 - 1 - 2',
                      marks: [],
                    },
                  ],
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
          leaves: [
            {
              id: uuid(),
              text: '2 - 2',
              marks: [],
            },
          ],
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
