import * as React from 'react';

import * as Clap from './clap';

interface DocProps {
}

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
            }
          ],
        }
      ],
    }
  ],
};

export class Doc extends React.Component {
  constructor(props: DocProps) {
    super(props);

    const doc = new Clap.DocumentNode(sampleDocument);
    console.log(doc);
    console.log(doc.toJSON());

    this.state = {
      document: doc.toJSON(),
    };
  }

  public render() {
    return <div>Doc</div>;
  }
}
