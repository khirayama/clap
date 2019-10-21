import * as Clap from '../index';

import { KeyBinder } from './KeyBinder';

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

export interface KeyMap {
  mode: Clap.Selection['mode'];
  keyCode: number;
  meta: boolean | null;
  ctrl: boolean | null;
  shift: boolean | null;
  alt: boolean | null;
}

export function createKeyBinder(): KeyBinder<Clap.Action['type'], KeyMap> {
  const keyBinder = new KeyBinder<Clap.Action['type'], KeyMap>();

  // In insert
  keyBinder.register(Clap.actionTypes.DOWN, {
    mode: 'select',
    keyCode: KEY_CODE.DOWN,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.DOWN, {
    mode: 'select',
    keyCode: KEY_CODE.J,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.UP, {
    mode: 'select',
    keyCode: KEY_CODE.UP,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.UP, {
    mode: 'select',
    keyCode: KEY_CODE.K,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.INSERT_MODE, {
    mode: 'select',
    keyCode: KEY_CODE.ENTER,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.INSERT_MODE_BEGINNING, {
    mode: 'select',
    keyCode: KEY_CODE.I,
    meta: null,
    ctrl: null,
    shift: true,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.INSERT_MODE, {
    mode: 'select',
    keyCode: KEY_CODE.I,
    meta: null,
    ctrl: null,
    shift: false,
    alt: null,
  });
  // In insert
  keyBinder.register(Clap.actionTypes.UP, {
    mode: 'insert',
    keyCode: KEY_CODE.UP,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.DOWN, {
    mode: 'insert',
    keyCode: KEY_CODE.DOWN,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.SELECT_MODE, {
    mode: 'insert',
    keyCode: KEY_CODE.C,
    meta: null,
    ctrl: true,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.SELECT_MODE, {
    mode: 'insert',
    keyCode: KEY_CODE.ESC,
    meta: null,
    ctrl: null,
    shift: null,
    alt: null,
  });
  keyBinder.register(Clap.actionTypes.ADD_AFTER, {
    mode: 'insert',
    keyCode: KEY_CODE.ENTER,
    meta: null,
    ctrl: false,
    shift: null,
    alt: null,
  });

  return keyBinder;
}
