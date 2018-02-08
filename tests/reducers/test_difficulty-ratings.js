import { markWordAsDifficult, markWordAsEasy } from './../../src/reducers/difficulty-ratings';
import assert from 'assert';

describe('Reducer: difficulty-ratings', () => {
    it('markWordAsDifficult', () => {
        const answers = {};
        const ratings = markWordAsDifficult({ answers }, 'A');
        assert.ok(ratings.A === 1);
    });
    it('markWordAsDifficult', () => {
        let answers = {};
        answers = markWordAsDifficult({ answers }, 'A');
        answers = markWordAsDifficult({ answers }, 'A');
        assert.ok(answers.A === 2);
    });
    it('markWordAsEasy', () => {
        const ratings = markWordAsEasy({ answers: { B: -5 } }, 'B');
        assert.ok(ratings.B === -6);
    });
});
