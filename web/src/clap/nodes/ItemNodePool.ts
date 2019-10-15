import { ItemNode } from './index';

export class ItemNodePool {
  private static pool: { [key: string]: ItemNode } = {};

  public static register(itemType: string, classObject: any) {
    ItemNodePool.pool[itemType] = classObject;
  }

  public static take(itemType: string) {
    return ItemNodePool.pool[itemType];
  }
}
