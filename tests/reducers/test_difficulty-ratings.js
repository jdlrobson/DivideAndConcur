import { clean,
    markWordAsDifficult, markWordAsEasy, revealedFlashcard
} from './../../src/reducers/difficulty-ratings';
import { MATCH_DEFINITION } from './../../src/constants';
import assert from 'assert';
import example from './example.json';

describe('Reducer: difficulty-ratings', () => {
    const action = {
        type: 'REVEAL-FLASHCARD',
        character: '小白',
        correctAnswer: '小心',
        isEnd: false,
        isRealWord: false,
        isKnown: false,
        paused: false,
        game: 'match-sound',
        index: 1
    };
    const newAnswers = revealedFlashcard(example.answers, action);
    assert.ok(newAnswers['小白'] === example.answers['小白'],
        'non-existent word not marked as not known as it is not a valid word');
    assert.ok(newAnswers['小心'] > example.answers['小心'],
        'incorrect word marked as more difficult');
    assert.ok(newAnswers['白'] > example.answers['白'],
        'word 白 marked as difficult (intersect between 小白 and 小心');
});

describe('Reducer: difficulty-ratings', () => {
    it('clean', () => {
        const answers = { a: 1, b: 2, c: 3, e: 5 };
        const ratings = clean(answers, { words: [
            { character: 'a', wordLength: 1, rating: 0 },
            { character: 'd', wordLength: 1, rating: 0 },
            { character: 'b', wordLength: 1, rating: 0 },
            { character: 'd', wordLength: 2, rating: 0 },
            { character: 'e', wordLength: 5, rating: 0 }
        ],
        cleanWordOrder: true });
        assert.ok(ratings.c === undefined, 'words not in the wordlist are ignored');
        assert.ok(ratings.a === 1);
        // Only wen cleanWordOrder is true
        assert.ok(ratings.e === undefined,
            'since d is unknown e cannot be possibly known given wordLength is higher');
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
    it('markWordAsDifficult (capped)', () => {
        let answers = { A: 5 };
        answers = markWordAsDifficult({ answers }, 'A');
        answers = markWordAsDifficult({ answers }, 'A');
        assert.ok(answers.A === 5, 'rating cannot go higher than 5');
    });
    it('can be 0', () => {
        const state = { answers: {} };
        const answers =  markWordAsDifficult(state, 'B');
        const newAnswers = markWordAsEasy({ answers }, 'B');
        assert.equal(newAnswers.B, 0, 'it was difficult then easy, now it is 0');
    });
    it('markWordAsEasy (undefined is marked as 0)', () => {
        const ratings = markWordAsEasy({ answers: {} }, 'B');
        assert.ok(ratings.B === 0, 'a rating if undefined to start with becomes 0');
    });
    it('markWordAsEasy (capped)', () => {
        const ratings = markWordAsEasy({ answers: { B: -5 } }, 'B');
        assert.ok(ratings.B === -5, 'a rating cannot go lower than -5');
    });
    it('revealedFlashcard', () => {
        const ratings = revealedFlashcard(
            { B: -5 },
            { character: 'B', game: MATCH_DEFINITION, isKnown: false }
        );
        assert.ok(ratings.B === -4, 'rating updated');
    });
});
