import assert from 'assert'
import Memory from './../src/Memory'

describe('Memory', function() {
  it('Memory score defaults to zero', function() {
    const memory = new Memory();
    assert.ok( memory.getScore() === 0 );
  });
  it('A correct answer adds 1 to the score', function() {
    const memory = new Memory();
    memory.markAsEasy('A');
    assert.ok( memory.getScore() === 1 );
  });
  it('A difficult answer subtracts 2 from the score', function() {
    const memory = new Memory();
    memory.markAsDifficult('A');
    assert.ok( memory.getScore() === -2 );
  });
  it('Memory loads with correct score', function() {
    const memory = new Memory( { answers: { 'A': 5, 'B': -2 } } );
    assert.ok( memory.getScore() === ( 5 * -2 ) + ( 2 * 1 ) );
  });
  it('Memory can be used to check if a user knows words', function() {
    const memory = new Memory( { answers: { 'A': -5, 'B': -3 } } );
    assert.ok( memory.knowsWords( [ 'A' ] ) );
    assert.ok( !memory.knowsWords( [ 'A', 'B' ] ) );
    assert.ok( !memory.knowsWords( [ 'A', 'B', 'C' ] ) );
  });
});
