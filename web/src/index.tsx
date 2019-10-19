import * as React from 'react';
import * as ReactDOM from 'react-dom';

import uuid from 'uuid/v4';

import * as Clap from './clap';

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

interface State {
  documentNode: Clap.DocumentNode;
  selection: Clap.Selection;
}

interface Action {
}

window.addEventListener('DOMContentLoaded', () => {
  const documentNode = new Clap.DocumentNode(sampleDocument);
  const selection = new Clap.Selection();
  const actionEmitter = new Clap.ActionEmitter<State, Action>({ documentNode, selection }, (state, action) => {
    console.log(state, action);
    return state;
  });
  ReactDOM.render(
    <Clap.Editor document={documentNode} selection={selection} />,
    window.document.querySelector('#root'),
  );
});
