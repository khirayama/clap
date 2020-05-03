import { DocumentNode } from './node';
import { Selection } from './selection';

export type Doc = {
  document: DocumentNode;
  users: {
    [userId: string]: Selection;
  };
};
