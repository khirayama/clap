export class ComponentPool {
  private static pool: { [key: string]: any } = {};

  public static register(nodeType: string, component: any) {
    ComponentPool.pool[nodeType] = component;
  }

  public static take(nodeType: string) {
    return ComponentPool.pool[nodeType];
  }
}
