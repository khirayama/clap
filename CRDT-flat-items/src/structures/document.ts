import { Item } from './item';

export type Document = {
  id: string;
  item: Item;
  meta: {
    title: string[];
  };
};
