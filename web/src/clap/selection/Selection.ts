export interface PureSelection {
  mode: 'normal' | 'select' | 'insert';
  id: string | null;
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

  public mode: PureSelection['mode'] = 'normal';

  // TODO: 複数item選択を考えると配列の必要がありそう
  public id: PureSelection['id'] = null;

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

  public toJSON() {
    return {
      mode: this.mode,
      id: this.id,
      range: this.range,
    };
  }
}
