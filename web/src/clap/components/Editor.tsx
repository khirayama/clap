import * as React from 'react';

import * as Clap from './clap';

interface EditorProps {
}

interface EditorState {
  currentNodeId: string | null;
  document: Clap.DocumentProperties;
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
            },
          ],
        },
      ],
    },
  ],
};

export class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    const doc = new Clap.DocumentNode(sampleDocument);
    console.log(doc);
    console.log(doc.toJSON());

    this.state = {
      currentNodeId: null,
      document: doc.toJSON(),
    };
  }

  public render() {
    return <div>Doc</div>;
  }
}
