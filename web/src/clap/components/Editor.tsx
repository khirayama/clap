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

export class InlineText extends React.Component<any, any> {
  public render(): JSX.Element {
    return <span>{this.props.children}</span>;
  }
}

export class Line extends React.Component<any, any> {
  public render(): JSX.Element {
    const props = this.props;

    return <div style={{ paddingLeft: `${props.indent * 10}px` }}>{props.children}</div>;
  }
}

export class Editor extends React.Component<EditorProps, EditorState> {
  private document: ClapNode.DocumentNode;

  constructor(props: EditorProps) {
    super(props);

    this.document = new ClapNode.DocumentNode(props.document);

    this.state = {
      cursor: {
        id: null,
        mode: 'normal',
      },
      document: this.document.toJSON(),
    };
  }

  private renderLeaves(leaves: any): JSX.Element {
    return leaves.map((leaf: any) => <span key={leaf.id}>{leaf.text}</span>);
  }

  private renderLines(node: any, indent: number = 0, lines: JSX.Element[] = []): JSX.Element[] {
    for (const n of node.nodes) {
      lines.push(
        <Line key={n.id} indent={indent}>
          {n.leaves ? this.renderLeaves(n.leaves) : ''}
        </Line>,
      );
      if (n.nodes) {
        lines.concat(this.renderLines(n, indent + 1, lines));
      }
    }
    return lines;
  }

  public render(): JSX.Element {
    const doc = this.props.document;

    return <div>{this.renderLines(doc)}</div>;
  }
}
