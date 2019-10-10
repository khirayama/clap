export class ShortcutCommander<T, P> {
  public pool: { keyMap: P; command: T }[] = [];

  public register(command: T, keyMap: P): void {
    this.pool.push({
      keyMap,
      command,
    });
  }

  public getCommand(keyMap: P): T | null {
    for (const shortcut of this.pool) {
      let isMatch = true;

      for (const key of Object.keys(shortcut.keyMap)) {
        const val = shortcut.keyMap[key];
        if (val !== null) {
          if (val !== keyMap[key]) {
            isMatch = false;
            break;
          }
        }
      }

      if (isMatch) {
        return shortcut.command;
      }
    }

    return null;
  }
}
