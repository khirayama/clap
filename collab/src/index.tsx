import * as uuid from 'uuid';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

type Item = ReturnType<typeof factory['createItem']>;

const factory = {
  createDoc: () => {
    const doc: Y.Doc = new Y.Doc();
    const data = doc.getMap('data');
    const items = new Y.Array();
    data.set('items', items);
    return doc;
  },

  createItem: () => {
    return new Y.Map(
      Object.entries({
        id: uuid.v4(),
        indent: 0,
        type: 'paragraph',
        text: new Y.Text(),
      }),
    );
  },
};

const doc = factory.createDoc();

const wsProvider = new WebsocketProvider('ws://localhost:5001', 'my-roomname', doc);
wsProvider.on('status', (event: any) => {
  console.log(event.status);
});

type EditorProps = {};

type EditorState = {
  text: string;
};

class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      text: '',
    };

    const text: Y.Text = doc.getText('sample');
    text.insert(0, 'AAA', { bold: true });
    text.insert(1, 'BBB', { bold: false });
  }

  public componentDidMount(): void {
    doc.on('update', () => {
      // this.forceUpdate();
      const text: Y.Text = doc.getText('sample');
      this.setState({ text: text.toString() });
    });
  }

  public render(): JSX.Element {
    // const text: Y.Text = new Y.Text();
    // data['text'] = text;

    // const items = data.get('items') as Y.Array<any>;
    // let item: Item | null = items.get(0) || null;
    // if (item === null) {
    //   item = factory.createItem();
    //   items.insert(0, [item]);
    // }
    // console.log(items.length);
    // const text: Y.Text = item.get('text') as Y.Text;
    // setInterval(() => {
    //   console.log(items.length);
    //   text.insert(0, 'AAA', { bold: true });
    //   text.insert(1, 'BBB', { bold: false });
    // }, 1000);

    return <div>{this.state.text}</div>;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Editor />, window.document.querySelector('#root'));
});
