/* FYI ******************************************
 * Inputting `a`
 *
 * Chrome *****************
 * keydown  |   | 65
 * keypress |   | 0
 * input    | a | undefined
 * change   | a | undefined
 * keyup    | a | 65
 *
 * Firefox ****************
 * keydown  |   | 65
 * keypress |   | 0
 * input    | a | undefined
 * change   | a | undefined
 * keyup    | a | 65
 *
 * Safari *****************
 * input    | a | undefined
 * change   | a | undefined
 * keydown  | a | 229
 * keyup    | a | 65
 *
 *
 * Inputting `あ` -> Enter
 *
 * Chrome *****************
 * keydown  |    | 229
 * compositionstart
 * input    | あ | undefined
 * change   | あ | undefined
 * keyup    | あ | 65
 *
 * keydown  | あ | 229
 * input    | あ | undefined
 * compositionend
 * keyup    | あ | 13
 *
 * Firefox ****************
 * keydown  |    | 229
 * compositionstart
 * input    | あ | undefined
 * change   | あ | undefined
 * keyup    | あ | 65
 *
 * keydown  | あ | 229
 * input    | あ | undefined
 * compositionend
 * keyup    | あ | 13
 *
 * Safari *****************
 * compositionstart
 * input    | あ | undefined
 * change   | あ | undefined
 * keydown  | あ | 229
 * keyup    | あ | 65
 *
 * input    |    | undefined
 * change   |    | undefined
 * input    | あ | undefined
 * change   | あ | undefined
 * compositionend
 * keydown  | あ | 229
 * keyup    | あ | 13
 *
 * ----------------------------------------------------------------------- *
 * keypress and keydown should not be used with contenteditable.
 * `input - keyup` flow is clear on any browser without IE. And when input event, textContent was updated.
 * When user keeps to push `a`, skip only `keyup` event on Chrome
 * ----------------------------------------------------------------------- *
 * Ref: [JavaScript とクロスブラウザでの IME event handling (2017年) - たにしきんぐダム](https://tanishiking24.hatenablog.com/entry/ime-event-handling-javascript)
 ************************************************/
