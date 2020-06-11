import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import * as React from 'react';

type EditorProps = {};

type EditorState = {
  items: Y.Array<string>;
};

const doc = new Y.Doc();

export class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      items: doc.getArray('items'),
    };
  }

  public componentDidMount(): void {
    const wsProvider = new WebsocketProvider('ws://localhost:5001', 'my-roomname', doc);
    wsProvider.on('status', (event: any) => {
      console.log(event.status);
    });

    doc.on('update', () => {
      console.log('update');
      this.setState({ items: doc.getArray('items') });
    });

    const items: Y.Array<string> = doc.getArray('items');
    items.insert(0, [new Date().toString()]);
    setInterval(() => {
      items.insert(0, [new Date().toString()]);
    }, 10000);
  }

  public render(): JSX.Element {
    return (
      <ul>
        {this.state.items.map((item: string) => {
          return <li key={item}>{item}</li>;
        })}
      </ul>
    );
  }
}
