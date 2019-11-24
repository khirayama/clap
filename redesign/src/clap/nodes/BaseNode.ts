import uuid from 'uuid/v4';

import { PureContent, Content, Node, ItemNode, DocumentNode } from './index';
import { TextContent } from './content/TextContent';

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
 * document
 * parent
 * next
 * prev
 * children
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

  public nodes: ItemNode[] | null = [];

  public contents: Content[] | null = [];

  public document: DocumentNode | null = [];

  public parent: Node | null = [];

  public relations: {
    prev: string | null;
    next: string | null;
  } = {
    prev: null,
    next: null,
  };

  private cache: { [key: string]: Node } = {};

  private listeners: ((node: Node) => void)[] = [];

  constructor(node?: Partial<PureNode>, relations?: BaseNode['relations']) {
    this.id = node ? node.id || uuid() : uuid();
    this.object = node ? node.object : 'item';
    this.type = node ? node.type : 'paragraph';

    if (this.isDocumentNode()) {
      this.relations.document = this;
    } else {
      this.relations = Object.assign({}, this.relations, relations) || this.relations;
    }
    const documentNode: DocumentNode = this.document();

    this.nodes =
      node && node.nodes
        ? node.nodes.map(
            (n: PureNode, i: number): ItemNode => {
              const nextNode = node.nodes[i + 1];
              const prevNode = node.nodes[i - 1];
              const relations = {
                document: this.relations.document,
                parent: this,
              };

              const nodeClass = documentNode.itemNodePool.take(n.type);
              const node = new (nodeClass as any)(n, relations);
            },
          )
        : [];
    this.contents =
      node && node.contents
        ? node.contents.map((content: PureContent) => {
            // TODO: Need pool
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
    const parentNode = this.parent();
    if (parentNode) {
      parentNode.dispatch();
    }
  }

  public on(listener: (node: Node) => void) {
    this.listeners.push(listener);
  }

  public off(listener: (node: Node) => void) {
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
  public find(id: string): Node | null {
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

  public document(): DocumentNode {
    return cache[this.relations.document];
  }

  public parent(): Node | null {
    return cache[this.relations.parent] || null;
  }

  public next(): Node | null {
    return cache[this.relations.next] || null;
  }

  public prev(): Node | null {
    return cache[this.relations.prev] || null;
  }

  public children(): Node[] | null {
    return this.nodes;
  }

  /*--- Command -----------------------------------------------------*/
  public after(node: ItemNode): ItemNode {
    const parentNode = this.parent();
    const len = parentNode.nodes.length;
    for (let i = 0; i < len; i += 1) {
      const n = parentNode.nodes[i];
      if (n.id === this.id) {
        const nextNode = n.parent().find(n.relations.next);

        node.relations = {
          document: n.relations.document,
          parent: n.relations.parent,
          next: n.relations.next,
          prev: n.id,
        };
        node.nodes = n.nodes.map((childNode: ItemNode) => {
          childNode.relations.parent = node.id;
          return childNode;
        });

        n.relations.next = node.id;
        n.nodes = [];

        if (nextNode) {
          nextNode.relations.prev = node.id;
        }

        parentNode.nodes.splice(i + 1, 0, node);
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
