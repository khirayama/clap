export interface PureSelection {
  isInputing: boolean;
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

  public isInputing: PureSelection['isInputing'] = false;

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
      isInputing: this.isInputing,
      mode: this.mode,
      ids: this.ids,
      range: this.range,
    };
  }
}
