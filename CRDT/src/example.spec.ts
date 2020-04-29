import * as assert from 'power-assert';

import './example';

describe('Run', () => {
  it('Correctly', () => {
    console.log('run by mocha');
  });
  it('Throw Error', () => {
    throw new Error('tada!');
  });
});
