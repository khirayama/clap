const rangePatterns = {
  a: '選択範囲が閉じている状態',
  b: '選択範囲が開いている状態',
  b_: '選択範囲が開いており終点が前点、始点が後点の状態',
};

const memberRangePatterns = {
  a: '共同編集者選択範囲が編集者と同じ位置の状態',
  b: '共同編集者選択範囲が閉じており、編集者選択範囲前点前にある状態',
  c: '共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲中にある状態',
  c_: '共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲中にある状態',
  d: '共同編集者選択範囲が開いており、始点が編集者選択範囲前点前、終点が編集者選択範囲後点後にある状態',
  d_: '共同編集者選択範囲が開いており、終点が編集者選択範囲前点前、始点が編集者選択範囲後点後にある状態',
  e: '共同編集者選択範囲が閉じており、編集者選択範囲中にある状態',
  f: '共同編集者選択範囲が開いており、始点が編集者選択範囲中、終点が編集者選択範囲中にある状態',
  f_: '共同編集者選択範囲が開いており、終点が編集者選択範囲中、始点が編集者選択範囲中にある状態',
  g: '共同編集者選択範囲が閉じており、編集者選択範囲後点後にある状態',
  h: '共同編集者選択範囲が干渉しない状態',
};

const inlinePatterns = {
  a: '単一インライン',
  b: '複数インラインで隣接するインラインにある状態',
  c: '複数インラインで間にインラインを跨ぐ状態',
};

describe('削除操作', () => {
  describe('インライン選択状態', () => {
    describe(`${rangePatterns.a}`, () => {
      describe('編集者選択範囲始点および終点が先頭の場合', () => {
        describe('段落項目以外の場合', () => {
          it.skip('', () => {});
        });

        describe('段落項目で親要素がドキュメントじゃない場合', () => {
          it.skip('', () => {});
        });

        describe('段落項目で親要素がドキュメントの場合', () => {
          describe('上項目がインラインを持つ場合', () => {
            it.skip('', () => {});
          });

          describe('上項目がインラインを持たない場合', () => {
            it.skip('', () => {});
          });
        });
      });

      describe('編集者選択範囲始点および終点が先頭でない場合', () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('1文字削除され、編集者および共同編集者の選択範囲始点と終点が1文字前へ移動していること', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('1文字削除され、編集者選択範囲のみの始点と終点が1文字前へ移動していること', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('1文字削除され、編集者選択範囲始点と終点が1文字前へ移動し、共同編集者選択範囲終点が1文字前へ移動していること', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('1文字削除され、編集者選択範囲始点と終点が1文字前へ移動し、共同編集者選択範囲始点が1文字前へ移動していること', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('1文字削除され、編集者および共同編集者の選択範囲始点と終点が1文字前へ移動していること', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('1文字削除され、編集者選択範囲のみの始点と終点が1文字前へ移動していること', () => {});
        });
      });
    });

    describe(`${rangePatterns.b}`, () => {
      describe(`${inlinePatterns.a}`, () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.e}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('', () => {});
        });
      });
      describe(`${inlinePatterns.b}`, () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.e}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('', () => {});
        });
      });

      describe(`${inlinePatterns.c}`, () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.e}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('', () => {});
        });
      });
    });

    describe(`${rangePatterns.b_}`, () => {
      describe(`${inlinePatterns.a}`, () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.e}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('', () => {});
        });
      });

      describe(`${inlinePatterns.b}`, () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.e}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('', () => {});
        });
      });

      describe(`${inlinePatterns.c}`, () => {
        describe(`${memberRangePatterns.a}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.b}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.c_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.d_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.e}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.f_}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.g}`, () => {
          it.skip('', () => {});
        });

        describe(`${memberRangePatterns.h}`, () => {
          it.skip('', () => {});
        });
      });
    });
  });
});
