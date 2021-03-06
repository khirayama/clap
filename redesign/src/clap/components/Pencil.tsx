import * as React from 'react';
import styled from 'styled-components';

import * as Clap from '../index';
import { Changeset } from '../ot';

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

/*
 * Pencil
 * private oprator
 * public render()
 * private noop()
 * private onKeyDown()
 * private onChange()
 * private onCompositionStart()
 * private onCompositionEnd()
 * private onDeleteKey()
 * private onLeftKey()
 * private onRightKey()
 * private insertText()
 * private computeInsertTextChangeset()
 * private computeDeleteTextChangeset()
 */

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

  private onDeleteKey() {
    // (1) Nothing to do when composing
    // (2) Delete chars when collasped range
    // (3) Delete chars when expanded range
    const selection = this.props.selection;

    if (selection.isComposing) {
      // (1) Nothing to do when composing
      // FYI: Depends on navite input element behavior
      this.noop();
    } else {
      if (selection.isCollasped()) {
        // (2) Delete chars when collasped range
        const changeset = this.computeDeleteTextChangeset();
        this.operator.emit(changeset);
      } else {
        // TODO: (3) Delete chars when expanded range
        console.log('TODO: (3) Delete chars when expanded range');
      }
    }
  }

  private onLeftKey() {
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

  private insertText(value: string) {
    const selection = this.props.selection;

    if (selection.isCollasped()) {
      if (selection.isComposing) {
        selection.compositionText = value;
        selection.dispatch();
      } else {
        const changeset = this.computeInsertTextChangeset(value);
        this.operator.emit(changeset);
      }
    }
  }

  private computeInsertTextChangeset(value: string): Clap.Changeset {
    // const document = this.props.document;
    // const selection = this.props.selection;
    //
    // const anchor = selection.range.anchor;
    // const changeset = new Clap.Changeset();
    //
    // let node = document;
    // let cursor = {
    //   item: -1,
    //   content: -1,
    // };
    //
    // while (node) {
    //   if (node.id === selection.ids[0]) {
    //     const itemMutation: Clap.ItemMutation = {
    //       type: 'retain',
    //       offset: 1,
    //       contentMutations: [],
    //     };
    //
    //     for (const content of node.contents) {
    //       if (content.id === anchor.id) {
    //         const textMutations: Clap.TextMutation[] = [];
    //         if (anchor.offset !== 0) {
    //           textMutations.push({
    //             type: 'retain',
    //             offset: anchor.offset,
    //           });
    //         }
    //         textMutations.push({
    //           type: 'insert',
    //           value,
    //         });
    //         if (content.text.length - anchor.offset !== 0) {
    //           textMutations.push({
    //             type: 'retain',
    //             offset: content.text.length - anchor.offset,
    //           });
    //         }
    //         itemMutation.contentMutations.push({
    //           type: 'retain',
    //           offset: 1,
    //           textMutations,
    //         });
    //         cursor.content += 1;
    //       } else {
    //         const contentMutation = itemMutation.contentMutations[cursor.content] || null;
    //         if (contentMutation && contentMutation.type === 'retain') {
    //           contentMutation.offset += 1;
    //         } else {
    //           itemMutation.contentMutations.push({
    //             type: 'retain',
    //             offset: 1,
    //             textMutations: [],
    //           });
    //           cursor.content += 1;
    //         }
    //       }
    //     }
    //     changeset.mutations.push(itemMutation);
    //     cursor.item += 1;
    //   } else {
    //     const itemMutation = changeset.mutations[cursor.item] || null;
    //     if (itemMutation && itemMutation.type === 'retain') {
    //       changeset.mutations[cursor.item].offset += 1;
    //     } else {
    //       changeset.mutations.push({
    //         type: 'retain',
    //         offset: 1,
    //         contentMutations: [],
    //       });
    //       cursor.item += 1;
    //     }
    //   }
    //   node = Clap.Exproler.findDownnerNode(node);
    // }

    const document = this.props.document;
    const selection = this.props.selection;

    const anchor = selection.range.anchor;

    const result = this.generateChangesetAndCursor();
    const targetCursor = result.cursor;
    const changeset = result.changeset;
    const content = document.find(selection.ids[0]).findContent(anchor.id);

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
    changeset.mutations[targetCursor.item].contentMutations[targetCursor.content].textMutations = textMutations;

    return changeset;
  }

  private computeDeleteTextChangeset(): Clap.Changeset {
    // (1) Delete a char when collasped range
    // (2) Delete content when text length is one
    // (3) Delete content when text length is one and content length is one
    // (4) Outdent item when in head of line
    const document = this.props.document;
    const selection = this.props.selection;

    const anchor = selection.range.anchor;

    // TODO: ここやってるんだけど、その前に、deletekeyの中でもgenerateChangesetAndCursorを使うようにするのが先っぽい
    const result = this.generateChangesetAndCursor();
    const targetCursor = result.cursor;
    const changeset = result.changeset;
    const node = document.find(selection.ids[0]);
    const content = node.findContent(anchor.id);

    if (anchor.offset !== 0) {
      if (Array.from(content.text).length !== 1) {
        // (1) Delete a char when collasped range
        const textMutations: Clap.TextMutation[] = [];
        textMutations.push({
          type: 'retain',
          offset: anchor.offset - 1,
        });
        textMutations.push({
          type: 'delete',
          count: 1,
        });
        if (Array.from(content.text).length - anchor.offset !== 0) {
          textMutations.push({
            type: 'retain',
            offset: Array.from(content.text).length - anchor.offset,
          });
        }
        changeset.mutations[targetCursor.item].contentMutations[targetCursor.content].textMutations = textMutations;
      } else {
        if (node.contents.length !== 1) {
          // TODO: (2) Delete content when text length is one and content length is not one
          console.log('TODO: (2) Delete content when text length is one and content length is not one');
          // for (let content of node.contents) {
          //   if (content.id === anchor.id) {
          //     console.log('delete', content);
          //     changeset.mutations[targetCursor.item].contentMutations.push({
          //       type: 'delete',
          //       count: 1,
          //       textMutations: [],
          //     });
          //   } else {
          //     const contentMutation = itemMutation.contentMutations[cursor.content] || null;
          //     if (contentMutation && contentMutation.type === 'retain') {
          //       contentMutation.offset += 1;
          //     } else {
          //       itemMutation.contentMutations.push({
          //         type: 'retain',
          //         offset: 1,
          //         textMutations: [],
          //       });
          //     }
          //   }
          // }
          // const contentMutations: Clap.ContentMutation[] = [
          //   {
          //     type: 'delete',
          //     count: 1,
          //     textMutations: [],
          //   },
          //   {
          //     type: 'retain',
          //     offset: itemMutation.contentMutations.length - 1,
          //     textMutations: [],
          //   },
          // ];
          // itemMutation.contentMutations = contentMutations;
        } else {
          // (3) Delete content when text length is one and content length is one
          changeset.mutations[targetCursor.item].contentMutations = [
            {
              type: 'retain',
              offset: 1,
              textMutations: [
                {
                  type: 'delete',
                  count: 1,
                },
              ],
            },
          ];
        }
      }
    } else {
      // TODO: (4) Outdent item when in head of line
      console.log('TODO: (4) Outdent item when in head of line');
    }
    console.log(changeset.mutations);
    return changeset;
  }

  private generateChangesetAndCursor(): { changeset: Changeset; cursor: { item: number; content: number } } {
    const cursor = {
      item: -1,
      content: -1,
    };
    const targetCursor = {
      item: -1,
      content: -1,
    };

    const document = this.props.document;
    const selection = this.props.selection;

    const anchor = selection.range.anchor;
    const changeset = new Clap.Changeset();

    let node = document;
    while (node) {
      if (node.id === selection.ids[0]) {
        const itemMutation: Clap.ItemMutation = {
          type: 'retain',
          offset: 1,
          contentMutations: [],
        };
        /* Content Start*/
        for (const content of node.contents) {
          if (content.id === anchor.id) {
            itemMutation.contentMutations.push({
              type: 'retain',
              offset: 1,
              textMutations: [],
            });
            cursor.content += 1;
            targetCursor.content = cursor.content;
          } else {
            const contentMutation = itemMutation.contentMutations[cursor.content] || null;
            if (contentMutation && contentMutation.type === 'retain' && cursor.content !== targetCursor.content) {
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
        /* Content End*/
        changeset.mutations.push(itemMutation);
        cursor.item += 1;
        targetCursor.item = cursor.item;
      } else {
        const itemMutation = changeset.mutations[cursor.item] || null;
        if (itemMutation && itemMutation.type === 'retain' && itemMutation.contentMutations.length === 0) {
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

    return {
      changeset,
      cursor: targetCursor,
    };
  }
}
