import * as React from 'react';
import * as ReactDOM from 'react-dom';
import uuid from 'uuid/v4';

import * as Clap from './clap';

/*
- [This is *a link*.]
*/

const sampleDocument: Clap.DocumentProperties = {
  object: 'document',
  nodes: [
    {
      id: uuid(),
      object: 'block',
      type: 'paragraph',
      nodes: [
        {
          id: uuid(),
          object: 'inline',
          type: 'link',
          nodes: [
            {
              id: uuid(),
              object: 'text',
              leaves: [
                {
                  id: uuid(),
                  object: 'leaf',
                  text: 'This is ',
                  marks: [],
                },
                {
                  id: uuid(),
                  object: 'leaf',
                  text: 'a link',
                  marks: ['bold'],
                },
                {
                  id: uuid(),
                  object: 'leaf',
                  text: '.',
                  marks: [],
                },
              ],
            },
          ],
        },
        {
          id: 'acda',
          object: 'text',
          leaves: [
            {
              id: 'cadscad',
              object: 'leaf',
              text: 'Hello',
              marks: [],
            },
            {
              id: 'cadsca',
              object: 'leaf',
              text: 'World',
              marks: [],
            },
          ],
        },
        {
          id: 'vkllllllll',
          object: 'block',
          type: 'paragraph',
          nodes: [
            {
              id: 'acdacasdca',
              object: 'text',
              leaves: [
                {
                  id: 'cadsccasdad',
                  object: 'leaf',
                  text: 'Hello',
                  marks: [],
                },
                {
                  id: 'cadsc...a',
                  object: 'leaf',
                  text: 'World',
                  marks: [],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'casdcads',
      object: 'block',
      type: 'paragraph',
      nodes: [
        {
          id: 'accasdcasd',
          object: 'text',
          leaves: [
            {
              id: 'casdcasdcasd',
              object: 'leaf',
              text: 'おはよう、',
              marks: [],
            },
            {
              id: 'caisascdklasndckads',
              object: 'leaf',
              text: '世界',
              marks: [],
            },
          ],
        },
      ],
    },
  ],
};

window.addEventListener('DOMContentLoaded', () => {
  console.log('start');
  ReactDOM.render(<Clap.Editor document={sampleDocument} />, window.document.querySelector('#root'));
});
