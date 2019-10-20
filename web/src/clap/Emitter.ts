type Listener<P> = (payload: P) => void;

export class Emitter<P> {
  private listeners: { [key: string]: Listener<P>[] } = {};

  public addListener(type: string, listener: Listener<P>): Emitter<P> {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(listener);
    return this;
  }

  public removeListener(type: string, listener: Listener<P>): Emitter<P> {
    if (!this.listeners[type]) {
      return this;
    }
    if (!this.listeners[type].length) {
      return this;
    }
    if (!listener) {
      delete this.listeners[type];
      return this;
    }
    this.listeners[type] = this.listeners[type].filter(_listener => !(_listener === listener));
    return this;
  }

  public emit(type: string, payload: P): Emitter<P> {
    if (!this.listeners[type]) {
      return this;
    }
    this.listeners[type].forEach((listener: Listener<P>) => {
      listener.apply(this, [payload]);
    });
    return this;
  }
}
