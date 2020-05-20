// Automerge/actions
import * as Automerge from 'automerge';

import { Board } from './interfaces';
import { init } from './usecases';

export class CRDTBoard {
  public userId: string;

  public board: Automerge.Doc<Board>;

  constructor(userId: string, serializedBoard?: string) {
    this.userId = userId;
    this.board = serializedBoard
      ? Automerge.load(serializedBoard, this.userId)
      : Automerge.from(init(this.userId), this.userId);
  }

  public change(func: Automerge.ChangeFn<Board>): void {
    this.board = Automerge.change(this.board, func);
  }

  public save(): string {
    return Automerge.save(this.board);
  }

  public merge(doc: CRDTBoard): void {
    this.board = Automerge.merge(this.board, doc.board);
  }
}
