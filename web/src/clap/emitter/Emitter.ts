type Listener<P> = (payload: P) => void;

type Middleware<P> = (type: string | Symbol, payload: P) => void;

export class Emitter<P> {
  private middlewares: Middleware<P>[] = [];

  private listeners: Map<string | Symbol, Listener<P>[]> = new Map();

  public use(middleware: Middleware<P>): Emitter<P> {
    this.middlewares.push(middleware);
    return this;
  }

  public addListener(type: string | Symbol, listener: Listener<P>): Emitter<P> {
    const listeners = this.listeners.get(type) || null;
    this.listeners.set(type, listeners ? [...listeners, listener] : [listener]);
    return this;
  }

  public removeListener(type: string | Symbol, listener: Listener<P>): Emitter<P> {
    if (!this.listeners.get(type)) {
      return this;
    }
    if (!this.listeners.get(type).length) {
      return this;
    }
    if (!listener) {
      this.listeners.delete(type);
      return this;
    }
    this.listeners.set(type, this.listeners.get(type).filter(_listener => !(_listener === listener)));
    return this;
  }

  public emit(type: string | Symbol, payload: P): Emitter<P> {
    for (const middleware of this.middlewares) {
      middleware.apply(this, [type, payload]);
    }

    if (!this.listeners.get(type)) {
      return this;
    }
    this.listeners.get(type).forEach((listener: Listener<P>) => {
      listener.apply(this, [payload]);
    });
    return this;
  }
}
