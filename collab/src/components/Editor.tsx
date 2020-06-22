import * as React from 'react';

type EditorState = {};

export class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    // noop
  }

  public render(): JSX.Element {
    return (
      <ul>
        {this.props.items.map((item) => {
          return <li key={item.id}>{item.inlines.map((inline) => inline.text.join())}</li>;
        })}
      </ul>
    );
  }
}
