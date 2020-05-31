import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { BoardHandler, factory } from 'olot';

import { Paper } from './components/Paper';
import { Pencil } from './components/Pencil';

const user = {
  id: factory.uuid(),
};

window.addEventListener('DOMContentLoaded', () => {
  const boardHandler = new BoardHandler(user.id);

  ReactDOM.render(
    <div>
      <Pencil userId={user.id} boardHandler={boardHandler} />
      <Paper userId={user.id} boardHandler={boardHandler} />
    </div>,
    window.document.querySelector('#root'),
  );
});
