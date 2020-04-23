import test from 'ava';

import { Selection } from './Selection';

test('.mode() - when ids is empty array, return "normal".', (t) => {
  const selection = new Selection();
  selection.ids = [];

  t.is(selection.mode(), 'normal');
});

test('.mode() - when ids is not empty array and range is null, return "select".', (t) => {
  const selection = new Selection();
  selection.ids = [''];
  selection.range = null;

  t.is(selection.mode(), 'select');
});

test('.mode() - when ids is not empty array and range is not null, return "insert".', (t) => {
  const selection = new Selection();
  selection.ids = [''];
  selection.range = {
    anchor: {
      id: '',
      offset: 0,
    },
    focus: {
      id: '',
      offset: 0,
    },
  };

  t.is(selection.mode(), 'insert');
});

test('.isCollasped() - when ids length is 1 and range is not null, return "insert".', (t) => {
  const selection = new Selection();
  selection.ids = [''];
  selection.range = {
    anchor: {
      id: '',
      offset: 0,
    },
    focus: {
      id: '',
      offset: 0,
    },
  };

  t.true(selection.isCollasped());
});

test('.isCollasped() - when ids length is not 1 and range is not null, return "insert".', (t) => {
  const selection = new Selection();
  selection.ids = [];
  selection.range = {
    anchor: {
      id: '',
      offset: 0,
    },
    focus: {
      id: '',
      offset: 0,
    },
  };

  t.false(selection.isCollasped());
});
