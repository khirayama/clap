import { Item } from './Item';

export type Document = {
  id: string;
  item: Item | null;
  meta: {
    title: string[];
  };
};
