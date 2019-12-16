export interface PureSelection {
  isComposing: boolean;
  mode: 'normal' | 'select' | 'insert';
  ids: string[];
  range: {
    anchor: {
      id: string;
      offset: number;
    };
    focus: {
      id: string;
      offset: number;
    };
  } | null;
}

export class Selection {
  private listeners: ((selection: Selection) => void)[] = [];

  public isComposing: PureSelection['isComposing'] = false;

  public mode: PureSelection['mode'] = 'normal';

  public ids: PureSelection['ids'] = [];

  public range: PureSelection['range'] = {
    anchor: {
      id: null,
      offset: 0,
    },
    focus: {
      id: null,
      offset: 0,
    },
  };

  constructor(selection?: Partial<PureSelection>) {
    this.isComposing = selection ? selection.isComposing : this.isComposing;
    this.mode = selection ? selection.mode : this.mode;
    this.ids = selection ? selection.ids : this.ids;
    this.range = selection ? { ...this.range, ...selection.range } : this.range;
  }

  public dispatch() {
    for (const listener of this.listeners) {
      listener(this);
    }
  }

  public on(listener: (selection: Selection) => void) {
    this.listeners.push(listener);
  }

  public off(listener: (selection: Selection) => void) {
    for (let i = 0; i < this.listeners.length; i += 1) {
      if (this.listeners[i] === listener) {
        this.listeners.splice(0, 1);
        break;
      }
    }
  }

  public toJSON(): PureSelection {
    return {
      isComposing: this.isComposing,
      mode: this.mode,
      ids: this.ids,
      range: this.range,
    };
  }
}
