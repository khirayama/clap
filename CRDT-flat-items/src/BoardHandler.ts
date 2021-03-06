// Automerge, usecase
import * as Automerge from 'automerge';

import { Board } from './structures';
import { init } from './usecases';

export class BoardHandler {
  public userId: string;

  public data: Automerge.Doc<Board>;

  private listeners: Function[] = [];

  constructor(userId: string, serializedData?: string) {
    this.userId = userId;
    this.data = serializedData
      ? Automerge.load(serializedData, this.userId)
      : Automerge.from(init(this.userId), this.userId);
  }

  public change(func: Automerge.ChangeFn<Board>): void {
    this.data = Automerge.change(this.data, func);
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  public save(): string {
    return Automerge.save(this.data);
  }

  public merge(serializedData: string, userId?: string): void {
    this.data = Automerge.merge(this.data, Automerge.load(serializedData, userId));
  }

  public on(listener: Function): void {
    this.listeners.push(listener);
  }
}
