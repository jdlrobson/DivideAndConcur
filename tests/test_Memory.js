import Memory from './../src/Memory';
import assert from 'assert';

describe('Memory', () => {
    it('Memory can be used to check if a user knows words', () => {
        const memory = new Memory({ answers: { 'A': -5, 'B': 1 } });
        assert.ok(memory.knowsWords([ 'A' ]));
        assert.ok(!memory.knowsWords([ 'A', 'B' ]));
        assert.ok(!memory.knowsWords([ 'A', 'B', 'C' ]));
    });
});
