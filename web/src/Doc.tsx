import * as React from 'react';

interface DocProps {
}

// https://docs.slatejs.org/guides/data-model
type Node = Block | Text;

interface Leaf {
  object: 'leaf';
  text: string;
  marks: ('bold' | 'italic' | 'code')[];
}

interface Document {
  object: 'document';
  nodes: Block[];
}

interface Block {
  object: 'block';
  type: 'paragraph';
  nodes: Node[];
}

interface Text {
  object: 'text';
  leaves: Leaf[];
}

const sampleDocument: Document = {
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

    this.state = {
      document: sampleDocument,
    };
  }

  public render() {
    return <div>Doc</div>;
  }
}
