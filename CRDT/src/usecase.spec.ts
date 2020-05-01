import * as assert from 'power-assert';

import { usecase } from './usecase';
import { CRDTDocument } from './CRDTDocument';
import { utils as selectionUtils } from './selection';
import { createSampleData } from './testutils';

let user: { id: string };
let member: { id: string };
let userDoc: CRDTDocument;
let memberDoc: CRDTDocument;

beforeEach(() => {
  const result = createSampleData();
  user = result.user;
  member = result.member;
  userDoc = result.userDoc;
  memberDoc = result.memberDoc;
});

describe('.insertText()', () => {
  describe('選択範囲が閉じている状態で', () => {
    describe('「あいうえお」と挿入したとき', () => {
      it('文字列が挿入されて選択範囲位置が文字数分後ろへ移動していること', () => {
        userDoc.change((doc) => {
          usecase.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        assert.deepEqual(userDoc.doc, {
          document: {
            id: userDoc.doc.document.id,
            object: 'document',
            type: null,
            inline: null,
            nodes: [
              {
                id: userDoc.doc.document.nodes[0].id,
                object: 'item',
                type: 'paragraph',
                document: userDoc.doc.document.id,
                parent: userDoc.doc.document.id,
                prev: null,
                next: null,
                inline: [
                  {
                    id: userDoc.doc.document.nodes[0].inline[0].id,
                    type: 'text',
                    text: ['あ', 'い', 'う', 'え', 'お'],
                    marks: [],
                  },
                ],
                nodes: [],
              },
            ],
            document: userDoc.doc.document.id,
            parent: null,
            prev: null,
            next: null,
            meta: { title: [] },
          },
          users: {
            [user.id]: {
              isComposing: false,
              compositionText: '',
              ids: [userDoc.doc.document.nodes[0].id],
              range: {
                anchor: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 5 } },
                focus: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 5 } },
              },
            },
            [member.id]: {
              isComposing: false,
              compositionText: '',
              ids: [userDoc.doc.document.nodes[0].id],
              range: {
                anchor: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 0 } },
                focus: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 0 } },
              },
            },
          },
        });
      });

      it('文字列が挿入されて共同編集者の選択範囲始点が文字数分後ろへ移動していること', () => {
        userDoc.change((doc) => {
          usecase.insertText(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 2));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 1));
          }
          usecase.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        assert.deepEqual(userDoc.doc, {
          document: {
            id: userDoc.doc.document.id,
            object: 'document',
            type: null,
            inline: null,
            nodes: [
              {
                id: userDoc.doc.document.nodes[0].id,
                object: 'item',
                type: 'paragraph',
                document: userDoc.doc.document.id,
                parent: userDoc.doc.document.id,
                prev: null,
                next: null,
                inline: [
                  {
                    id: userDoc.doc.document.nodes[0].inline[0].id,
                    type: 'text',
                    text: ['1', 'あ', 'い', 'う', 'え', 'お', '2', '3'],
                    marks: [],
                  },
                ],
                nodes: [],
              },
            ],
            document: userDoc.doc.document.id,
            parent: null,
            prev: null,
            next: null,
            meta: { title: [] },
          },
          users: {
            [user.id]: {
              isComposing: false,
              compositionText: '',
              ids: [userDoc.doc.document.nodes[0].id],
              range: {
                anchor: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 6 } },
                focus: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 6 } },
              },
            },
            [member.id]: {
              isComposing: false,
              compositionText: '',
              ids: [userDoc.doc.document.nodes[0].id],
              range: {
                anchor: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 7 } },
                focus: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 7 } },
              },
            },
          },
        });
      });

      it('文字列が挿入されて共同編集者の選択範囲終点が文字数分後ろへ移動していること', () => {
        userDoc.change((doc) => {
          usecase.insertText(user.id, doc, ['1', '2', '3']);
        });
        memberDoc.merge(userDoc);
        memberDoc.change((doc) => {
          const range = doc.users[member.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 2));
          }
        });
        userDoc.merge(memberDoc);
        userDoc.change((doc) => {
          const range = doc.users[user.id].range;
          if (range !== null) {
            range.anchor.offset.increment(selectionUtils.getOffset(range.anchor.offset.value, 1));
            range.focus.offset.increment(selectionUtils.getOffset(range.focus.offset.value, 1));
          }
          usecase.insertText(user.id, doc, ['あ', 'い', 'う', 'え', 'お']);
        });
        assert.deepEqual(userDoc.doc, {
          document: {
            id: userDoc.doc.document.id,
            object: 'document',
            type: null,
            inline: null,
            nodes: [
              {
                id: userDoc.doc.document.nodes[0].id,
                object: 'item',
                type: 'paragraph',
                document: userDoc.doc.document.id,
                parent: userDoc.doc.document.id,
                prev: null,
                next: null,
                inline: [
                  {
                    id: userDoc.doc.document.nodes[0].inline[0].id,
                    type: 'text',
                    text: ['1', 'あ', 'い', 'う', 'え', 'お', '2', '3'],
                    marks: [],
                  },
                ],
                nodes: [],
              },
            ],
            document: userDoc.doc.document.id,
            parent: null,
            prev: null,
            next: null,
            meta: { title: [] },
          },
          users: {
            [user.id]: {
              isComposing: false,
              compositionText: '',
              ids: [userDoc.doc.document.nodes[0].id],
              range: {
                anchor: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 6 } },
                focus: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 6 } },
              },
            },
            [member.id]: {
              isComposing: false,
              compositionText: '',
              ids: [userDoc.doc.document.nodes[0].id],
              range: {
                anchor: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 1 } },
                focus: { id: userDoc.doc.document.nodes[0].inline[0].id, offset: { value: 7 } },
              },
            },
          },
        });
      });
    });
  });
});
