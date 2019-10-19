import uuid from 'uuid/v4';

import { PureContent, Content, Node, ItemNode, DocumentNode } from './index';
import { TextContent } from './content/TextContent';
import { ItemNodePool } from './ItemNodePool';

export interface PureNode {
  id: string;
  object: 'document' | 'item';
  type: 'document' | 'paragraph' | 'horizontal-rule';
  nodes: PureNode[] | null;
  contents: PureContent[] | null;
}

const cache: { [key: string]: Node } = {};

/*
 * BaseNode
 * id
 * object
 * type
 * nodes
 * contents
 * relations
 *  document
 *  parent
 *  next
 *  prev
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

  public relations: {
    document: string | null;
    parent: string | null;
    next: string | null;
    prev: string | null;
  } = {
    document: null,
    parent: null,
    next: null,
    prev: null,
  };

  private listeners: ((node: Node) => void)[] = [];

  constructor(node?: Partial<PureNode>, relations?: BaseNode['relations']) {
    this.id = node ? node.id || uuid() : uuid();
    this.object = node ? node.object : 'item';
    this.type = node ? node.type : 'paragraph';

    if (this.isDocumentNode()) {
      this.relations.document = this.id;
    } else {
      this.relations = Object.assign({}, this.relations, relations) || this.relations;
    }

    this.nodes =
      node && node.nodes
        ? node.nodes.map(
            (n: PureNode, i: number): ItemNode => {
              const nextNode = node.nodes[i + 1];
              const prevNode = node.nodes[i - 1];
              const relations = {
                // TODO
                document: this.relations.document,
                parent: this.id,
                next: nextNode ? nextNode.id : null,
                prev: prevNode ? prevNode.id : null,
              };

              const nodeClass = ItemNodePool.take(n.type);
              return new (nodeClass as any)(n, relations);
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

    cache[this.id] = this;
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
      nodes: this.nodes ? this.nodes.map(node => node.toJSON()) : null,
      contents: this.contents ? this.contents.map(content => content.toJSON()) : null,
    };
  }

  /*--- Query -----------------------------------------------------*/
  public find(id: string): Node | null {
    if (cache[id]) {
      return cache[id];
    }

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
        node.nodes = n.nodes.map(childNode => {
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

  /*--- Check -----------------------------------------------------*/
  public isDocumentNode(): boolean {
    return this.object === 'document';
  }

  public isItemNode(): boolean {
    return this.object === 'item';
  }
}
