import * as React from 'react';

import * as Clap from './clap';

interface DocProps {
}

const sampleDocument: Clap.DocumentProperties = {
  object: 'document',
  nodes: [
    {
      object: 'block',
      type: 'paragraph',
      nodes: [
        {
          object: 'text',
          leaves: [
            {
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

    this.state = {
      document: doc.toJSON(),
    };
  }

  public render() {
    return <div>Doc</div>;
  }
}
