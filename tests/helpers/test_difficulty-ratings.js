import { getDifficultyRating,
    getKnownWordCount, knowsWord } from './../../src/helpers/difficulty-ratings';
import assert from 'assert';

describe('Helper:difficulty-ratings', () => {
    it('getDifficultyRating', () => {
        const data = { A: 5 };
        assert.ok(getDifficultyRating(data, 'A') === 5);
        assert.ok(getDifficultyRating(data, 'B') === 0);
    });
    it('knowsWord', () => {
        const data = { A: 5, B: 0, C: -1 };
        assert.ok(knowsWord(data, 'C'));
        assert.ok(!knowsWord(data, 'B'));
        assert.ok(!knowsWord(data, 'A'));
    });
    it('getKnownWordCount', () => {
        const data = { A: 5, B: 0, C: -1, D: -2 };
        assert.ok(getKnownWordCount(data) === 2);
    });
});
