import { Document } from './structures/document';
import { Selection } from './structures/selection';

export type Board = {
  document: Document;
  users: {
    [userId: string]: Selection;
  };
};
