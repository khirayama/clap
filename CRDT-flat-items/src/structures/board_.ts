import { Document } from './document';
import { Selection } from './selection';

export type Board = {
  document: Document;
  users: {
    [userId: string]: Selection;
  };
};
