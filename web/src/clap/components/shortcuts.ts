import { Cursor } from './Editor';
import { ShortcutCommander } from './shortcutCommander';

export enum Command {
  UP,
  DOWN,
  INSERT,
  SELECT,
  ADD_AFTER,
}

export const KEY_CODE = {
  ENTER: 13,
  ESC: 27,
  UP: 38,
  DOWN: 40,
  C: 67,
  I: 73,
  J: 74,
  K: 75,
};

interface KeyMap {
  mode: Cursor['mode'];
  keyCode: number;
  meta: boolean | null;
  ctrl: boolean | null;
  shift: boolean | null;
}

export const shortcutCommander = new ShortcutCommander<Command, KeyMap>();
shortcutCommander.register(Command.DOWN, {
  mode: 'select',
  keyCode: KEY_CODE.DOWN,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.DOWN, {
  mode: 'select',
  keyCode: KEY_CODE.J,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.DOWN, {
  mode: 'insert',
  keyCode: KEY_CODE.DOWN,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.UP, {
  mode: 'select',
  keyCode: KEY_CODE.UP,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.UP, {
  mode: 'select',
  keyCode: KEY_CODE.K,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.UP, {
  mode: 'insert',
  keyCode: KEY_CODE.UP,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.INSERT, {
  mode: 'select',
  keyCode: KEY_CODE.ENTER,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.INSERT, {
  mode: 'select',
  keyCode: KEY_CODE.I,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.SELECT, {
  mode: 'insert',
  keyCode: KEY_CODE.ESC,
  meta: null,
  ctrl: null,
  shift: null,
});
shortcutCommander.register(Command.SELECT, {
  mode: 'insert',
  keyCode: KEY_CODE.C,
  meta: null,
  ctrl: true,
  shift: null,
});
shortcutCommander.register(Command.ADD_AFTER, {
  mode: 'insert',
  keyCode: KEY_CODE.ENTER,
  meta: null,
  ctrl: false,
  shift: null,
});
