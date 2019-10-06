import * as React from 'react';

import * as ClapNode from '../nodes';

interface EditorProps {
  document: ClapNode.DocumentProperties;
}

interface EditorState {
  cursor: {
    id: string | null;
    mode: 'normal' | 'select' | 'insert';
  };
  document: ClapNode.DocumentProperties;
}

export class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    const doc = new ClapNode.DocumentNode(props.document);

    this.state = {
      cursor: {
        id: null,
        mode: 'normal',
      },
      document: doc.toJSON(),
    };
  }

  public render() {
    return <div>Doc</div>;
  }
}
