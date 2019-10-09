import { ItemNode } from './index';

export class ItemNodePool {
  private static pool: { [key: string]: ItemNode } = {};

  public static register(classObject: any) {
    ItemNodePool.pool[classObject.type] = classObject;
  }

  public static take(itemType: string) {
    return ItemNodePool.pool[itemType];
  }
}
