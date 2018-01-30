import assert from 'assert'
import Memory from './../src/Memory'

describe('Memory', function() {
  it('Memory can be used to check if a user knows words', function() {
    const memory = new Memory( { answers: { 'A': -5, 'B': 1 } } );
    assert.ok( memory.knowsWords( [ 'A' ] ) );
    assert.ok( !memory.knowsWords( [ 'A', 'B' ] ) );
    assert.ok( !memory.knowsWords( [ 'A', 'B', 'C' ] ) );
  });
});
