import { Item } from './Item';

export type Document = {
  id: string;
  items: Item[];
  meta: {
    title: string[];
  };
};
