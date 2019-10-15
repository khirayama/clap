export class Cursor {
  public mode: 'normal' | 'select' | 'insert' = 'normal';

  public id: string | null = null;

  public selection: {
    anchor: {
      id: string;
      offset: number;
    };
    focus: {
      id: string;
      offset: number;
    };
  } = {
    anchor: {
      id: null,
      offset: 0,
    },
    focus: {
      id: null,
      offset: 0,
    },
  };
}
