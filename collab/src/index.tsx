import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const doc: Y.Doc = new Y.Doc();

const wsProvider = new WebsocketProvider('ws://localhost:5001', 'my-roomname', doc);
wsProvider.on('status', (event: any) => {
  console.log(event.status);
});

type EditorProps = {};

type EditorState = {};

class Editor extends React.Component<EditorProps, EditorState> {
  public render(): JSX.Element {
    return <div>This is editor</div>;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Editor />, window.document.querySelector('#root'));
});
