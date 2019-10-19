const ACTION_DISPATCH: string = '__ACTION_DISPATCH';

type TListener<Action> = (action: Action) => void;

export class ActionEmitter<T, P> {
  private listeners: {
    [key: string]: {
      listener: TListener<P>;
    }[];
  } = {};

  private state: T;

  private reducer: (state: T, action: P) => T;

  constructor(state: T, reducer: (state: T, action: P) => T) {
    this.state = state;
    this.reducer = reducer;

    this.subscribe();
  }

  public dispatch(action: P): void {
    this.emit(ACTION_DISPATCH, action);
  }

  private emit(eventType: string, payload: P | null): ActionEmitter<T, P> {
    if (!this.listeners[eventType]) {
      return this;
    }
    this.listeners[eventType].forEach((listener: { listener: TListener<P> }) => {
      listener.listener.apply(this, [payload]);
    });

    return this;
  }

  private addListener(eventType: string, listener: TListener<P>): ActionEmitter<T, P> {
    this.listeners[eventType] = this.listeners[eventType] || [];
    this.listeners[eventType].push({ listener });

    return this;
  }

  private removeListener(eventType: string, removedListener: TListener<P>): ActionEmitter<T, P> {
    if (!this.listeners[eventType]) {
      return this;
    }
    if (!this.listeners[eventType].length) {
      return this;
    }
    if (!removedListener) {
      this.listeners[eventType] = undefined;

      return this;
    }
    this.listeners[eventType] = this.listeners[eventType].filter(
      (listener: { listener: TListener<P> }) => !(listener.listener === removedListener),
    );

    return this;
  }

  private subscribe(): void {
    this.addListener(ACTION_DISPATCH, (action: P): void => {
      this.reducer(this.state, action);
    });
  }
}
