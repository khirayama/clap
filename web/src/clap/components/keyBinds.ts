import * as Clap from '../index';

import { KeyBinder } from './KeyBinder';

export enum Command {
  UP,
  DOWN,
  INSERT,
  INSERT_BEGINNING,
  SELECT,
  ADD_AFTER,
}

export const KEY_CODE = {
  ENTER: 13,
  ESC: 27,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  C: 67,
  I: 73,
  J: 74,
  K: 75,
};

interface KeyMap {
  mode: Clap.Selection['mode'];
  keyCode: number;
  meta: boolean | null;
  ctrl: boolean | null;
  shift: boolean | null;
  alt: boolean | null;
}

export const keyBinder = new KeyBinder<Command, KeyMap>();
keyBinder.register(Command.DOWN, {
  mode: 'select',
  keyCode: KEY_CODE.DOWN,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.DOWN, {
  mode: 'select',
  keyCode: KEY_CODE.J,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.DOWN, {
  mode: 'insert',
  keyCode: KEY_CODE.DOWN,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.UP, {
  mode: 'select',
  keyCode: KEY_CODE.UP,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.UP, {
  mode: 'select',
  keyCode: KEY_CODE.K,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.UP, {
  mode: 'insert',
  keyCode: KEY_CODE.UP,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.INSERT, {
  mode: 'select',
  keyCode: KEY_CODE.ENTER,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.INSERT_BEGINNING, {
  mode: 'select',
  keyCode: KEY_CODE.I,
  meta: null,
  ctrl: null,
  shift: true,
  alt: null,
});
keyBinder.register(Command.INSERT, {
  mode: 'select',
  keyCode: KEY_CODE.I,
  meta: null,
  ctrl: null,
  shift: false,
  alt: null,
});
keyBinder.register(Command.SELECT, {
  mode: 'insert',
  keyCode: KEY_CODE.ESC,
  meta: null,
  ctrl: null,
  shift: null,
  alt: null,
});
keyBinder.register(Command.SELECT, {
  mode: 'insert',
  keyCode: KEY_CODE.C,
  meta: null,
  ctrl: true,
  shift: null,
  alt: null,
});
keyBinder.register(Command.ADD_AFTER, {
  mode: 'insert',
  keyCode: KEY_CODE.ENTER,
  meta: null,
  ctrl: false,
  shift: null,
  alt: null,
});
