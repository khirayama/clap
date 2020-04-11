import uuid from 'uuid';

import { PureContent, Content, DocumentNode, ItemNode, TextContent, ParagraphNode } from './index';

export interface PureNode {
  id: string;
  object: 'document' | 'item';
  type: 'document' | 'paragraph' | 'horizontal-rule';
  nodes: PureNode[] | null;
  contents: PureContent[] | null;
}

/*
 * BaseNode
 * id
 * object
 * type
 * nodes
 * contents
 * document
 * parent
 * next
 * prev
 *
 * listeners
 *
 * dispatch
 * on
 * off
 *
 * toJSON
 *
 * find
 *
 * after
 *
 * isDocumentNode
 * isItemNode
 */

export abstract class BaseNode {
  public id: PureNode['id'];

  public object: PureNode['object'] = 'item';

  public type: PureNode['type'] = 'paragraph';

  public nodes: BaseNode[] | null = [];

  public contents: Content[] | null = [new TextContent()];

  public document: DocumentNode | null = null;

  public parent: BaseNode | null = null;

  public next: BaseNode | null = null;

  public prev: BaseNode | null = null;

  private listeners: ((node: BaseNode) => void)[] = [];

  private cache: { nodes: { [key: string]: BaseNode }; contents: { [key: string]: TextContent } } = {
    nodes: {},
    contents: {},
  };

  constructor(node?: Partial<PureNode>) {
    this.id = node ? node.id || uuid.v4() : uuid.v4();
    this.object = node ? node.object : this.object;
    this.type = node ? node.type : this.type;

    if (this.isDocumentNode()) {
      this.document = this;
    }

    this.nodes =
      node && node.nodes
        ? node.nodes.map(
            (n: PureNode, i: number): BaseNode => {
              // TODO: Need pool to switch node
              const prevPureNode = node.nodes[i - 1];
              const nextPureNode = node.nodes[i + 1];
              const prevNode = prevPureNode ? this.cache.nodes[prevPureNode.id] || null : null;
              const nextNode = nextPureNode ? this.cache.nodes[nextPureNode.id] || null : null;

              const newNode: BaseNode = new ParagraphNode(n);
              newNode.document = this.document;
              newNode.parent = this;

              if (prevNode) {
                newNode.prev = prevNode;
                prevNode.next = newNode;
              }
              if (nextNode) {
                newNode.next = nextNode;
              }

              this.cache.nodes[newNode.id] = newNode;
              return newNode;
            },
          )
        : [];
    this.contents =
      node && node.contents !== null
        ? node.contents.map((content: PureContent, i: number) => {
            // TODO: Need pool to switch content
            const prevPureContent = node.contents[i - 1];
            const nextPureContent = node.contents[i + 1];
            const prevContent = prevPureContent ? this.cache.contents[prevPureContent.id] || null : null;
            const nextContent = nextPureContent ? this.cache.contents[nextPureContent.id] || null : null;

            const textContent = new TextContent(content);
            textContent.parent = this;

            if (prevContent) {
              textContent.prev = prevContent;
              prevContent.next = textContent;
            }
            if (nextContent) {
              textContent.next = nextContent;
            }

            this.cache.contents[content.id] = textContent;
            return textContent;
          })
        : node && node.contents === null
        ? null
        : [];
  }

  /*--- Event Emitter -----------------------------------------------------*/
  public dispatch() {
    for (const listener of this.listeners) {
      listener(this);
    }
    // Propagation
    if (this.parent) {
      this.parent.dispatch();
    }
  }

  public on(listener: (node: BaseNode) => void) {
    this.listeners.push(listener);
  }

  public off(listener: (node: BaseNode) => void) {
    for (let i = 0; i < this.listeners.length; i += 1) {
      if (this.listeners[i] === listener) {
        this.listeners.splice(0, 1);
        break;
      }
    }
  }

  /*--- toJSON -----------------------------------------------------*/
  public toJSON(): PureNode {
    return {
      id: this.id,
      object: this.object,
      type: this.type,
      contents: this.contents ? this.contents.map((content) => content.toJSON()) : null,
      nodes: this.nodes ? this.nodes.map((node) => node.toJSON()) : null,
    };
  }

  /*--- Query -----------------------------------------------------*/
  public find(id: string): BaseNode | null {
    if (this.id === id) {
      return this;
    } else if (this.nodes && this.nodes.length) {
      for (const node of this.nodes) {
        const result = node.find(id);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  public findContent(contentId: string): Content | null {
    for (const content of this.contents) {
      if (content.id === contentId) {
        return content;
      }
    }

    return null;
  }

  /*--- Command -----------------------------------------------------*/
  public after(node: BaseNode): BaseNode {
    const len = this.parent.nodes.length;
    for (let i = 0; i < len; i += 1) {
      const n = this.parent.nodes[i];
      if (n.id === this.id) {
        node.document = n.document;
        node.parent = n.parent;
        node.next = n.next;
        node.prev = n;
        node.nodes = n.nodes.map((childNode: BaseNode) => {
          childNode.parent = node;
          return childNode;
        });

        n.next = node;
        n.nodes = [];

        if (n.next) {
          n.next.prev = node;
        }

        this.parent.nodes.splice(i + 1, 0, node);
        break;
      }
    }
    this.dispatch();
    return node;
  }

  public updateText(nodeId: string, contentId: string, text: string) {
    const node = this.find(nodeId);
    if (node) {
      const content = node.findContent(contentId);
      if (content && content.text !== text) {
        if (text) {
          content.text = text;
        } else {
          if (node.contents.length === 1) {
            node.contents[0].text = text;
            node.contents[0].marks = [];
          } else {
            node.contents = node.contents.filter((tmp) => content.id !== tmp.id);
          }
        }
      }
      node.dispatch();
    }
  }

  /*--- Check -----------------------------------------------------*/
  public isDocumentNode(): this is DocumentNode {
    return this.object === 'document';
  }

  public isItemNode(): this is ItemNode {
    return this.object === 'item';
  }
}
