import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
`;

interface PencilProps {
  document: Clap.DocumentNode;
  selection: Clap.Selection;
}

interface PencilState {
  value: string;
}

const keyCodes = {
  DELETE: 8,
  ENTER: 13,
  LEFT: 37,
  TOP: 38,
  RIGHT: 39,
  DOWN: 40,
};

export class Pencil extends React.Component<PencilProps, PencilState> {
  private operator: Clap.ClientOperator;

  constructor(props: PencilProps) {
    super(props);

    this.state = {
      value: '',
    };

    this.operator = new Clap.ClientOperator(props.document, props.selection);
    this.noop = this.noop.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onCompositionStart = this.onCompositionStart.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCompositionEnd = this.onCompositionEnd.bind(this);
  }

  public render(): JSX.Element {
    return (
      <Wrapper>
        <input
          autoFocus
          value={this.state.value}
          onKeyDown={this.onKeyDown}
          onCompositionStart={this.onCompositionStart}
          onInput={this.noop}
          onChange={this.onChange}
          onKeyPress={this.noop}
          onCompositionEnd={this.onCompositionEnd}
          onKeyUp={this.noop}
        />
      </Wrapper>
    );
  }

  private noop(): void {
    return;
  }

  private onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    console.log(`${event.type} - ${event.currentTarget.value} - ${event.keyCode}`);
    const keyCode = event.keyCode;
    const metaKey = event.metaKey; // Command
    const ctrlKey = event.ctrlKey; // Ctrl
    const shiftKey = event.shiftKey; // Shift
    const altKey = event.altKey; // Option
    console.log(keyCode, metaKey, ctrlKey, shiftKey, altKey);

    switch (keyCode) {
      case keyCodes.DELETE: {
        // TODO: shiftなどの分岐は、case文の中で処理する。onDeleteKeyWithShiftみたいな感じ。
        this.onDeleteKey();
        break;
      }
      case keyCodes.LEFT: {
        this.onLeftKey();
        break;
      }
      case keyCodes.RIGHT: {
        this.onRightKey();
        break;
      }
    }
  }

  private onChange(event: React.FormEvent<HTMLInputElement>): void {
    const selection = this.props.selection;

    const value = event.currentTarget.value;
    if (selection.isComposing) {
      this.setState({ value });
    } else {
      this.setState({ value: '' });
    }
    this.insertText(value);
  }

  private onCompositionStart() {
    const selection = this.props.selection;
    selection.isComposing = true;
  }

  private onCompositionEnd(event: React.CompositionEvent<HTMLInputElement>) {
    const selection = this.props.selection;
    selection.isComposing = false;
    selection.compositionText = '';

    const value = event.currentTarget.value;
    this.setState({ value: '' });
    this.insertText(value);
  }

  private insertText(value: string) {
    const document = this.props.document;
    const selection = this.props.selection;

    if (selection.isCollasped()) {
      if (selection.isComposing) {
        selection.compositionText = value;
        selection.dispatch();
      } else {
        const anchor = selection.range.anchor;
        const changeset = new Clap.Changeset(document);

        let node = document;
        let cursor = {
          item: -1,
          content: -1,
        };
        while (node) {
          if (node.id === selection.ids[0]) {
            // Item
            const itemMutation: Clap.ItemMutation = {
              type: 'retain',
              offset: 1,
              contentMutations: [],
            };

            for (const content of node.contents) {
              if (content.id === anchor.id) {
                const textMutations: Clap.TextMutation[] = [];
                if (anchor.offset !== 0) {
                  textMutations.push({
                    type: 'retain',
                    offset: anchor.offset,
                  });
                }
                textMutations.push({
                  type: 'insert',
                  value,
                });
                if (content.text.length - anchor.offset !== 0) {
                  textMutations.push({
                    type: 'retain',
                    offset: content.text.length - anchor.offset,
                  });
                }
                itemMutation.contentMutations.push({
                  type: 'retain',
                  offset: 1,
                  textMutations,
                });
                cursor.content += 1;
              } else {
                const contentMutation = itemMutation.contentMutations[cursor.content] || null;
                if (contentMutation && contentMutation.type === 'retain') {
                  contentMutation.offset += 1;
                } else {
                  itemMutation.contentMutations.push({
                    type: 'retain',
                    offset: 1,
                    textMutations: [],
                  });
                  cursor.content += 1;
                }
              }
            }
            changeset.mutations.push(itemMutation);
            cursor.item += 1;
          } else {
            const itemMutation = changeset.mutations[cursor.item] || null;
            if (itemMutation && itemMutation.type === 'retain') {
              changeset.mutations[cursor.item].offset += 1;
            } else {
              changeset.mutations.push({
                type: 'retain',
                offset: 1,
                contentMutations: [],
              });
              cursor.item += 1;
            }
          }
          node = Clap.Exproler.findDownnerNode(node);
        }
        this.operator.emit(changeset);
      }
    }
  }

  private onDeleteKey() {
    // Considered cases.
    // (1) Nothing to do when composing
    // (2) Delete a char when collasped range
    // (3) Delete content when text length is one
    // (4) Outdent item when in head of line
    // (5) Delete chars when expanded range
    const document = this.props.document;
    const selection = this.props.selection;

    if (selection.isComposing) {
      // (1) Nothing to do when composing
      // FYI: Depends on navite input element behavior
      this.noop();
    } else {
      const node = document.find(selection.ids[0]);
      const anchor = selection.range.anchor;
      const content = node.findContent(anchor.id);

      if (selection.isCollasped()) {
        const changeset = new Clap.Changeset(document);
        const itemMutation = changeset.findItemMutation(node.id);
        const contentMutation = itemMutation.contentMutations.filter(cm => cm.id === content.id)[0] || null;
        contentMutation.textMutations = [];
        if (anchor.offset !== 0) {
          if (content.text.length === 1) {
            // TODO: (3) Delete content when text length is one
            console.log('TODO: (3) Delete content when text length is one');
            const contentMutations: Clap.ContentMutation[] = [
              {
                type: 'delete',
                count: 1,
                textMutations: [],
              },
              {
                type: 'retain',
                offset: itemMutation.contentMutations.length - 1,
                textMutations: [],
              },
            ];
            itemMutation.contentMutations = contentMutations;
          } else {
            // (2) Delete a char when collasped range
            contentMutation.textMutations.push({
              type: 'retain',
              offset: anchor.offset - 1,
            });
            contentMutation.textMutations.push({
              type: 'delete',
              count: 1,
            });
            if (content.text.length - anchor.offset !== 0) {
              contentMutation.textMutations.push({
                type: 'retain',
                offset: content.text.length - anchor.offset,
              });
            }
          }
        } else {
          // TODO: (4) Outdent item when in head of line
          console.log('TODO: (4) Outdent item when in head of line');
        }
        this.operator.emit(changeset);
      } else {
        // TODO: (5) Delete chars when expanded range
        console.log('TODO: (5) Delete chars when expanded range');
      }
    }
  }

  private onLeftKey() {
    // Considered cases.
    // (1) Nothing to do when composing
    // (2) Move to prev content end when pressing on content start
    // (3) Move to prev content end of prev item when pressing on content start
    // (4) Move one offset left
    // (5) Transition to collaspe to left edge when expanded
    const document = this.props.document;
    const selection = this.props.selection;
    if (selection.isComposing) {
      // (1) Nothing to do when composing
      // FYI: Depends on navite input element behavior
      this.noop();
    } else {
      if (selection.isCollasped()) {
        const node = document.find(selection.ids[0]);
        const anchor = selection.range.anchor;
        const content = node.findContent(anchor.id);
        if (selection.range.anchor.offset === 1 && content.prev) {
          // (2) Move to prev content end when pressing on content start
          selection.range.anchor.id = content.prev.id;
          selection.range.anchor.offset = content.prev.text.length;
          selection.range.focus.id = content.prev.id;
          selection.range.focus.offset = content.prev.text.length;
        } else if (selection.range.anchor.offset === 0) {
          // (3) Move to prev content end when pressing on content start
          let upperNode = Clap.Exproler.findUpperNode(node);
          while (upperNode && upperNode.contents === null) {
            upperNode = Clap.Exproler.findUpperNode(upperNode);
          }
          if (upperNode) {
            const nextContent = upperNode.contents[upperNode.contents.length - 1];
            selection.ids = [upperNode.id];
            selection.range.anchor.id = nextContent.id;
            selection.range.anchor.offset = nextContent.text.length;
            selection.range.focus.id = nextContent.id;
            selection.range.focus.offset = nextContent.text.length;
          }
        } else {
          // (4) Move one offset left
          selection.range.anchor.offset = selection.range.anchor.offset === 0 ? 0 : selection.range.anchor.offset - 1;
          selection.range.focus.offset = selection.range.focus.offset === 0 ? 0 : selection.range.focus.offset - 1;
        }
        selection.dispatch();
      } else {
        // TODO: (5) Transition to collaspe to left edge when expanded
        console.log('TODO: (5) Transition to collaspe to left edge when expanded');
      }
    }
  }

  private onRightKey() {
    // Considered cases.
    // (1) Nothing to do when composing
    // (2) Move to next content start when pressing on content end
    // (3) Move to next content start of next item when pressing on content end
    // (4) Move one offset right
    // (5) Transition to collaspe to right edge when expanded
    const document = this.props.document;
    const selection = this.props.selection;
    if (selection.isComposing) {
      // (1) Nothing to do when composing
      // FYI: Depends on navite input element behavior
      this.noop();
    } else {
      if (selection.isCollasped()) {
        const node = document.find(selection.ids[0]);
        const anchor = selection.range.anchor;
        const content = node.findContent(anchor.id);
        if (selection.range.anchor.offset === content.text.length) {
          if (content.next) {
            // (2) Move to next content start when pressing on content end
            selection.range.anchor.id = content.next.id;
            selection.range.anchor.offset = 1;
            selection.range.focus.id = content.next.id;
            selection.range.focus.offset = 1;
          } else {
            // (3) Move to next content start of next item when pressing on content end
            let downnerNode = Clap.Exproler.findDownnerNode(node);
            while (downnerNode && downnerNode.contents === null) {
              downnerNode = Clap.Exproler.findDownnerNode(downnerNode);
            }
            if (downnerNode) {
              const nextContent = downnerNode.contents[0];
              selection.ids = [downnerNode.id];
              selection.range.anchor.id = nextContent.id;
              selection.range.anchor.offset = 0;
              selection.range.focus.id = nextContent.id;
              selection.range.focus.offset = 0;
            }
          }
        } else {
          // (4) Move one offset right
          selection.range.anchor.offset += 1;
          selection.range.focus.offset += 1;
        }
        selection.dispatch();
      } else {
        // TODO: (5) Transition to collaspe to right edge when expanded
        console.log('(5) Transition to collaspe to right edge when expanded');
      }
    }
  }
}
