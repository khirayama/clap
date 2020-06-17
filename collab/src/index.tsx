import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Item } from './model';
import { textToTextData, textDataToDoc } from './parser';
import { Editor } from './components/Editor';

const text = `LINE1
LINE2
  LINE3 indent1
  LINE4 indent1
## LINE5 Heading
- LINE6
- LINE7\`{date: '2020-06-14'}\`
- [ ] LINE8\`{comments: }\`
`;

const textData = textToTextData(text);
const doc = textDataToDoc(textData);

console.log(textData);
// const tmpDoc = new Y.Doc();

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
  ReactDOM.render(<EditorBinding items={[]} />, window.document.querySelector('#root'));
});
