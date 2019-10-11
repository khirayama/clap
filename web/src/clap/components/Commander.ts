type Args = any;
type Listener = (...args: Args) => void;

export class Commander<T> {
  private listeners: Map<T, Listener[]> = new Map();

  public register(command: T, listener: Listener) {
    const targetListeners = this.listeners.get(command);
    if (targetListeners) {
      targetListeners.push(listener);
      this.listeners.set(command, targetListeners);
    } else {
      this.listeners.set(command, [listener]);
    }
  }

  public execute(command: T, args?: Args[]) {
    const targetListeners = this.listeners.get(command);
    if (targetListeners) {
      for (const listener of targetListeners) {
        listener(args);
      }
    }
  }
}
