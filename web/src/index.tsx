import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Doc } from './Doc';

window.addEventListener('DOMContentLoaded', () => {
  console.log('start');
  ReactDOM.render(<Doc />, window.document.querySelector('#root'));
});
