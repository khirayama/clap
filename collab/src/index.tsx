import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Item } from './model';
import { Editor } from './components/Editor';

const tmpDoc = new Y.Doc();
const items = tmpDoc.getArray('items');
items.observe((event: any) => {
  console.log(event);
});
items.insert(0, [1]);

type EditorBindingProps = {
  items: Item[];
};

type EditorBindingState = {
  items: Y.Array<Item>;
};

class EditorBinding extends React.Component<EditorBindingProps, EditorBindingState> {
  public doc: Y.Doc = new Y.Doc();

  constructor(props: EditorBindingProps) {
    super(props);

    const wsProvider = new WebsocketProvider('ws://localhost:5001', 'my-roomname', this.doc);
    wsProvider.on('status', (event: any) => {
      console.log(event.status);
    });
  }

  public componentDidMount(): void {
    // this.props.doc.on('update', () => {
    //   this.setState({ items: this.props.doc.getArray('items') });
    // });
  }

  public render() {
    const items = this.props.items.map((item: Item) => item.toJSON());
    return <Editor items={items} />;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const items = [new Item()];
  ReactDOM.render(<EditorBinding items={items} />, window.document.querySelector('#root'));
});
