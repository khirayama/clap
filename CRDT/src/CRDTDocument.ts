import * as Automerge from 'automerge';

import { factory } from './factory';

type Doc = ReturnType<typeof factory.utils.init>;

export class CRDTDocument {
  public userId: string;

  public doc: Automerge.Doc<Doc>;

  constructor(userId: string, serializedDocument?: string) {
    this.userId = userId;
    this.doc = serializedDocument
      ? Automerge.load(serializedDocument, this.userId)
      : Automerge.from(factory.utils.init(this.userId), this.userId);
  }

  public change(func: Automerge.ChangeFn<this['doc']>): void {
    this.doc = Automerge.change(this.doc, func);
  }

  public save(): string {
    return Automerge.save(this.doc);
  }

  public merge(doc: CRDTDocument): void {
    this.doc = Automerge.merge(this.doc, doc.doc);
  }
}