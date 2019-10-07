import * as React from 'react';

import * as ClapNode from '../nodes/index';

export class Paragraph extends React.Component<{ node: ClapNode.PureParagraphNode }> {
  public render(): JSX.Element {
    const node = this.props.node;

    return <p>{node.attributes.text}</p>;
  }
}
