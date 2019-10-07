import { ItemNode } from './index';

export class ItemPool {
  private static pool: { [key: string]: ItemNode } = {};

  public static register(classObject: any) {
    ItemPool.pool[classObject.type] = classObject;
  }

  public static take(itemType: string) {
    return ItemPool.pool[itemType];
  }
}
