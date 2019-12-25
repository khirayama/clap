export interface PureSelection {
  // independent - update following values in Pencil
  mode: 'normal' | 'select' | 'insert';
  compositionText: string;
  // TODO: compositionについてもrangeがいるな
  isComposing: boolean;
  isCollasped: boolean;
  // dependent - update following values in OT
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

  public compositionText: string = '';

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

  public isCollasped(): boolean {
    return (
      this.ids.length === 1 &&
      this.range.anchor.id === this.range.focus.id &&
      this.range.anchor.offset === this.range.focus.offset
    );
  }

  public toJSON(): PureSelection {
    return {
      isComposing: this.isComposing,
      isCollasped: this.isCollasped(),
      compositionText: this.compositionText,
      mode: this.mode,
      ids: this.ids,
      range: this.range,
    };
  }
}
