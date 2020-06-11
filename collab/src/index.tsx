import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Editor } from './components/Editor';

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <div>
      <Editor />
    </div>,
    window.document.querySelector('#root'),
  );
});
