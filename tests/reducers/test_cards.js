import { getHardCards, getKnownCards, getUnknownCards } from './../../src/reducers/cards';
import assert from 'assert';

const words = [
    { character: '!', rating: 24, wordLength: 2 },
    { character: 'A', rating: 24, wordLength: 2 },
    { character: 'B', rating: 24, wordLength: 2 },
    { character: 'c', rating: 24, wordLength: 2 },
    { character: 'Z', rating: 24, wordLength: 2 },
    { character: 'D', rating: 24, wordLength: 2 },
    { character: 'E', rating: 24, wordLength: 2 },
];
describe('Reducer: cards', () => {
    it('getUnknownCards are cards that have no answers', () => {
        const state = {
            answers: { A: -2, B: -2, Z: -6, c: 0 },
            words
        };
        const cards = getUnknownCards(state);
        assert.equal(cards.length, words.length - 4,
            'only 4 cards have ratings in answers. rest are unknown.');
    });

    it('getHardCards', () => {
        const state = {
            // hard is < 0
            answers: { A: 2, B: 2, c: 0, D: 5 },
            words
        };
        const cards = getHardCards(state);
        assert.equal(cards.length, 4, '4 cards have ratings >= than 0: A, B, and d');
    });

    it('getKnownCards', () => {
        const state = {
            // hard is < 0
            answers: { A: -2, B: -2, c: 0 },
            words
        };
        const cards = getKnownCards(state);
        assert.equal(cards.length, 2, '2 cards have ratings < than 0: A and B');
    });
});
