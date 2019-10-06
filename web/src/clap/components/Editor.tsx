import * as React from 'react';

import * as ClapNode from '../nodes';

interface EditorProps {
  document: ClapNode.DocumentProperties;
}

interface EditorState {
  currentNodeId: string | null;
  document: ClapNode.DocumentProperties;
}

export class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    const doc = new ClapNode.DocumentNode(props.document);
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
