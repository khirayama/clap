import { Document } from './Document';
import { Selection } from './Selection';

export type Board = {
  document: Document;
  users: {
    [userId: string]: Selection;
  };
};
