import uuid from 'uuid/v4';

import { PureContent, Content, DocumentNode, ItemNode } from './index';
import { TextContent } from './content/TextContent';

export interface PureNode {
  id: string;
  object: 'document' | 'item';
  type: 'document' | 'paragraph' | 'horizontal-rule';
  nodes: PureNode[] | null;
  contents: PureContent[] | null;
}

export interface NodeRelation {
  document: DocumentNode | null;
  parent: BaseNode | null;
  prev: BaseNode | null;
  next: BaseNode | null;
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

export class BaseNode {
  public id: PureNode['id'];

  public object: PureNode['object'];

  public type: PureNode['type'];

  public nodes: BaseNode[] | null = [];

  public contents: Content[] | null = [];

  public document: DocumentNode | null = null;

  public parent: BaseNode | null = null;

  public next: BaseNode | null = null;

  public prev: BaseNode | null = null;

  private relations: {
    document: DocumentNode | null;
    parent: BaseNode | null;
    nextId: string | null;
    prevId: string | null;
  } = {
    document: null,
    parent: null,
    nextId: null,
    prevId: null,
  };

  private cache: { [key: string]: BaseNode } = {};

  private listeners: ((node: BaseNode) => void)[] = [];

  constructor(node?: Partial<PureNode>, relations?: NodeRelation) {
    this.id = node ? node.id || uuid() : uuid();
    this.object = node ? node.object : 'item';
    this.type = node ? node.type : 'paragraph';

    if (this.isDocumentNode()) {
      this.document = this;
    } else {
      this.document = relations ? relations.document : null;
    }
    this.parent = relations ? relations.parent : null;
    this.next = relations ? relations.next : null;
    this.prev = relations ? relations.prev : null;

    this.nodes =
      node && node.nodes
        ? node.nodes.map(
            (n: PureNode, i: number): BaseNode => {
              // TODO: Need pool to switch node
              // const newNode: ItemNode = new (nodeClass as any)(n, relations);
              const prevNode = node.nodes[i - 1];
              const nextNode = node.nodes[i + 1];

              const newNode: BaseNode = new BaseNode(n, {
                document: this.document,
                parent: this,
                prev: prevNode ? this.cache[prevNode.id] : null,
                next: nextNode ? this.cache[nextNode.id] : null,
              });
              this.cache[newNode.id] = newNode;
              return newNode;
            },
          )
        : [];
    this.contents =
      node && node.contents
        ? node.contents.map((content: PureContent) => {
            // TODO: Need pool to switch content
            return new TextContent(content);
          })
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
      contents: this.contents ? this.contents.map(content => content.toJSON()) : null,
      nodes: this.nodes ? this.nodes.map(node => node.toJSON()) : null,
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
            node.contents = node.contents.filter(tmp => content.id !== tmp.id);
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
