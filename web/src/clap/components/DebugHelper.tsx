import * as React from 'react';
import styled from 'styled-components';
import XRegExp from 'xregexp';

import * as Clap from '../index';

interface DebugHelperProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

interface DebugHelperState {
  document: Clap.PureNode;
  selection: Clap.PureSelection;
}

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  display: inline-block;
  white-space: pre;
  background: rgba(55, 55, 55, 0.93);
  color: #fff;
  font-family: serif;
  max-width: 50%;
  height: 100%;
  overflow: scroll;
  font-size: 0.75rem;

  code {
    position: relative;
    display: inline-block;
    width: 100%;
    padding: 8px;

    label {
      display: inline-block;
      position: absolute;
      top: 0;
      right: 0;
      padding: 4px;
      background: rgba(255, 255, 255, 0.67);
    }
  }

  hr {
    width: 100%;
    border-top: solid 1px #fff;
  }

  .node-block {
    color: rgba(255, 255, 255, 0.56);

    &.node-block__active {
      color: rgba(255, 255, 255, 1);
      background: rgba(0, 0, 0, 0.73);

      .node-block {
        color: rgba(255, 255, 255, 0.56);
      }
    }
  }
`;

export class DebugHelper extends React.Component<DebugHelperProps, DebugHelperState> {
  constructor(props: DebugHelperProps) {
    super(props);

    this.state = {
      selection: this.props.selection.toJSON(),
      document: this.props.document.toJSON(),
    };
  }

  public componentDidMount() {
    this.props.selection.on(() => {
      this.setState({
        selection: this.props.selection.toJSON(),
      });
    });
    this.props.document.on(() => {
      this.setState({
        document: this.props.document.toJSON(),
      });
    });
  }

  private htmlNode(node: Clap.PureNode): any {
    let content = JSON.stringify(node, null, 2);
    content = XRegExp.replace(
      content,
      // FYI: Firefox and Safari RegExp doesn't support flag `s`.
      // FYI: [New flags :: XRegExp](http://xregexp.com/flags/)
      XRegExp('"nodes": \\[.*\\]', 'gms'),
      `"nodes": [${node.nodes ? node.nodes.map(n => this.htmlNode(n)).join('') : ''}]`,
    );
    let classNames = ['node-block'];
    if (node.id === this.state.selection.id) {
      classNames.push('node-block__active');
    }
    return `<span class="${classNames.join(' ')}">${content}</span>`;
  }

  private renderCurrentNode(node: Clap.Node) {
    if (node) {
      const currentNode = node.toJSON();
      delete currentNode.nodes;
      return JSON.stringify(currentNode, null, 2);
    }
    return 'null';
  }

  public render() {
    return (
      <Wrapper>
        <code>
          <label>selection</label>
          {JSON.stringify(this.state.selection, null, 2)}
        </code>
        <hr />
        <code>
          <label>current node</label>
          {this.renderCurrentNode(this.props.document.find(this.state.selection.id))}
        </code>
        <hr />
        <code>
          <label>document</label>
          <div dangerouslySetInnerHTML={{ __html: this.htmlNode(this.state.document) }} />
        </code>
      </Wrapper>
    );
  }
}
