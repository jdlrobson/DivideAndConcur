import { clean,
    markWordAsDifficult, markWordAsEasy
} from './../../src/reducers/difficulty-ratings';
import assert from 'assert';

describe('Reducer: difficulty-ratings', () => {
    it('clean', () => {
        const answers = { a: 1, b: 2, c: 3 };
        const ratings = clean(answers, { words: [
            { character: 'a' },
            { character: 'd' },
            { character: 'b' }
        ] });
        assert.ok(ratings.c === undefined, 'words not in the wordlist are ignored');
        assert.ok(ratings.a === 1);
    });
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
