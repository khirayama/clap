/**
 * Selection
 * private listeners
 * public isComposing
 * public compositionText
 * public ids
 * public range
 * public dispatch()
 * public on()
 * public off()
 * public mode()
 * public isCollasped()
 * public toJSON()
 */

export class Selection {
  private listeners: ((selection: Selection) => void)[] = [];

  public isComposing: boolean = false;

  public compositionText: string = '';

  public ids: string[] = [];

  public range: {
    anchor: {
      id: string;
      offset: number;
    };
    focus: {
      id: string;
      offset: number;
    };
  } | null = null;

  constructor(selection?: Partial<ReturnType<Selection['toJSON']>>) {
    this.isComposing = selection ? selection.isComposing || this.isComposing : this.isComposing;
    this.ids = selection && selection.ids ? selection.ids : this.ids;
    this.range = selection && selection.range ? { ...this.range, ...selection.range } : this.range;
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

  public mode(): 'normal' | 'select' | 'insert' {
    if (this.ids.length === 0) {
      return 'normal';
    } else if (this.range === null) {
      return 'select';
    } else {
      return 'insert';
    }
  }

  public isCollasped(): boolean {
    return !!(
      this.ids.length === 1 &&
      this.range &&
      this.range.anchor.id === this.range.focus.id &&
      this.range.anchor.offset === this.range.focus.offset
    );
  }

  public toJSON() {
    return {
      mode: this.mode(),
      isCollasped: this.isCollasped(),
      isComposing: this.isComposing,
      compositionText: this.compositionText,
      ids: this.ids,
      range: this.range,
    };
  }
}
