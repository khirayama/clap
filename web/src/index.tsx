import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Editor } from './clap';

window.addEventListener('DOMContentLoaded', () => {
  console.log('start');
  ReactDOM.render(<Editor />, window.document.querySelector('#root'));
});
