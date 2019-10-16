export class KeyBinder<T, P> {
  public pool: { keyMap: P; command: T; precheck?: (event: any) => boolean }[] = [];

  public register(command: T, keyMap: P, precheck?: (event: any) => boolean): void {
    this.pool.push({
      keyMap,
      command,
      precheck,
    });
  }

  public getCommand(keyMap: P, event: any): T | null {
    console.log(keyMap);

    for (const keyBind of this.pool) {
      let isMatch = true;

      for (const key of Object.keys(keyBind.keyMap)) {
        const val = keyBind.keyMap[key];
        if (val !== null) {
          if (val !== keyMap[key]) {
            isMatch = false;
            break;
          }
        }
      }

      if (isMatch) {
        if (keyBind.precheck && !keyBind.precheck(event)) {
          return null;
        }
        return keyBind.command;
      }
    }

    return null;
  }
}
