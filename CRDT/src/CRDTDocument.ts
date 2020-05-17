// Automerge/actions
import * as Automerge from 'automerge';
import { Doc } from './interfaces';
import { init } from './usecases';

export class CRDTDocument {
  public userId: string;

  public doc: Automerge.Doc<Doc>;

  constructor(userId: string, serializedDocument?: string) {
    this.userId = userId;
    this.doc = serializedDocument
      ? Automerge.load(serializedDocument, this.userId)
      : Automerge.from(init(this.userId), this.userId);
  }

  public change(func: Automerge.ChangeFn<Doc>): void {
    this.doc = Automerge.change(this.doc, func);
  }

  public save(): string {
    return Automerge.save(this.doc);
  }

  public merge(doc: CRDTDocument): void {
    this.doc = Automerge.merge(this.doc, doc.doc);
  }
}
