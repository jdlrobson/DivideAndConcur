import { markWordAsDifficult, markWordAsEasy } from './../../src/reducers/difficulty-ratings';
import assert from 'assert';

describe('Reducer: difficulty-ratings', () => {
    it('markWordAsDifficult', () => {
        const ratings = markWordAsDifficult({}, 'A');
        assert.ok(ratings.A === 1);
    });
    it('markWordAsDifficult', () => {
        const ratings = markWordAsDifficult(markWordAsDifficult({}, 'A'), 'A');
        assert.ok(ratings.A === 2);
    });
    it('markWordAsEasy', () => {
        const ratings = markWordAsEasy({ B: -5 }, 'B');
        assert.ok(ratings.B === -6);
    });
});
