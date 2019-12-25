import * as React from 'react';
import * as ReactDOM from 'react-dom';

import uuid from 'uuid/v4';

import * as Clap from './clap/index';

const sampleDocument: Clap.PureNode = {
  id: uuid(),
  object: 'document',
  type: 'document',
  contents: null,
  nodes: [
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      contents: [
        {
          id: uuid(),
          text: '1',
          object: 'text',
          marks: [],
        },
      ],
      nodes: [
        {
          id: uuid(),
          object: 'item',
          type: 'paragraph',
          contents: [
            {
              id: uuid(),
              object: 'text',
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
              contents: [
                {
                  id: uuid(),
                  text: '1 - ',
                  object: 'text',
                  marks: [
                    {
                      type: 'italic',
                    },
                  ],
                },
                {
                  id: uuid(),
                  text: '1 -',
                  object: 'text',
                  marks: [
                    {
                      type: 'bold',
                    },
                  ],
                },
                {
                  id: uuid(),
                  text: '1',
                  object: 'text',
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
          contents: [
            {
              id: uuid(),
              text: '1 - 2',
              object: 'text',
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
      contents: null,
      nodes: null,
    },
    {
      id: uuid(),
      object: 'item',
      type: 'paragraph',
      contents: [
        {
          id: uuid(),
          text: '2',
          object: 'text',
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
          contents: [
            {
              id: uuid(),
              text: '2 - 1',
              object: 'text',
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
              contents: [
                {
                  id: uuid(),
                  text: '2 - 1 - 1',
                  object: 'text',
                  marks: [],
                },
              ],
              nodes: [
                {
                  id: uuid(),
                  object: 'item',
                  type: 'paragraph',
                  contents: [
                    {
                      id: uuid(),
                      text: '2 - 1 - 1 - 1',
                      object: 'text',
                      marks: [],
                    },
                  ],
                  nodes: [],
                },
                {
                  id: uuid(),
                  object: 'item',
                  type: 'paragraph',
                  contents: [
                    {
                      id: uuid(),
                      text: '2 - 1 - 1 - 2',
                      object: 'text',
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
          contents: [
            {
              id: uuid(),
              text: '2 - 2',
              object: 'text',
              marks: [],
            },
          ],
          nodes: [],
        },
      ],
    },
  ],
};

const targetNode = sampleDocument.nodes[0].nodes[0].nodes[0];
console.log(targetNode);
const sampleSelection: Clap.PureSelection = {
  isComposing: false,
  isCollasped: true,
  compositionText: '',
  mode: 'select',
  ids: [targetNode.id],
  range: {
    anchor: {
      id: targetNode.contents[0].id,
      offset: 2,
    },
    focus: {
      id: targetNode.contents[0].id,
      offset: 2,
    },
  },
};

window.addEventListener('DOMContentLoaded', () => {
  const document = new Clap.DocumentNode(sampleDocument);
  const selection = new Clap.Selection(sampleSelection);

  ReactDOM.render(<Clap.Editor document={document} selection={selection} />, window.document.querySelector('#root'));
});
