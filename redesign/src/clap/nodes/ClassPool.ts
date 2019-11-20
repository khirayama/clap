type Klass<T> = { new (): T };

export class ClassPool<T> {
  private pool: { [key: string]: Klass<T> } = {};

  public register(key: string, klass: Klass<T>) {
    this.pool[key] = klass;
  }

  public take(key: string): Klass<T> {
    return this.pool[key];
  }
}
