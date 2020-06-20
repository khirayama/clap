import * as uuid from 'uuid';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const doc: Y.Doc = new Y.Doc();

const wsProvider = new WebsocketProvider('ws://localhost:5001', 'my-roomname', doc);
wsProvider.on('status', (event: any) => {
  console.log(event.status);
});

type Item = Y.Map<{
  id: string;
  indent: number;
  type: string;
  text: Y.Text | null;
}>;

const factory = {
  createItem: (): Item => {
    const item: Item = new Y.Map(
      Object.entries({
        id: uuid.v4(),
        indent: 0,
        type: 'paragraph',
        text: new Y.Text(),
      }),
    );
    return item;
  },
};

type EditorProps = {};

type EditorState = {};

class Editor extends React.Component<EditorProps, EditorState> {
  public render(): JSX.Element {
    const item = factory.createItem();
    const text: Y.Text = item.get('text');
    text.insert(0, 'AAA', { bold: true });
    text.insert(1, 'BBB', { bold: false });

    return <div>{text.toString()}</div>;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Editor />, window.document.querySelector('#root'));
});
