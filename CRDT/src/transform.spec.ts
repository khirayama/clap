import * as assert from 'power-assert';

import { transform } from './transform';

describe('.utils.insertText()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('「あいうえお」と挿入したとき', () => {
      it('文字列が挿入されて選択範囲位置が文字数分後ろへ移動していること', () => {});
      it('文字列が挿入されて共同編集者の選択範囲始点が文字数分後ろへ移動していること', () => {});
      it('文字列が挿入されて共同編集者の選択範囲終点が文字数分後ろへ移動していること', () => {});
    });
  });
});
