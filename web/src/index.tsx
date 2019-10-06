import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Clap from './clap';

const sampleDocument: Clap.DocumentProperties = {
  object: 'document',
  nodes: [
    {
      id: 'vkllllllll',
      object: 'block',
      type: 'paragraph',
      nodes: [
        {
          id: 'acda',
          object: 'text',
          leaves: [
            {
              id: 'cadsca',
              object: 'leaf',
              text: '',
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
