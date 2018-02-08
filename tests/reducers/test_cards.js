import assert from 'assert';
import { getUnknownCards } from './../../src/reducers/cards';

describe('Reducer: cards', () => {
    it('getUnknownCards', () => {
        const state = {
            answers: { A: -2, B: -2, Z: -6 },
            words: [
                { character: '!', rating: 20, wordLength: 1 },
                { character: 'A', rating: 24, wordLength: 2 },
                { character: 'B', rating: 24, wordLength: 2 },
                { character: 'c', rating: 24, wordLength: 2 },
                { character: 'Z', rating: 24, wordLength: 2 },
                { character: 'D', rating: 24, wordLength: 2 },
                { character: 'E', rating: 24, wordLength: 2 }
            ]
        };
        const cards = getUnknownCards(state, 2);
        assert.ok(cards.length === 2, 'length is correct');
        assert.equal(cards[0].character, 'c', 'c is first card (! too hard)');
        assert.equal(cards[1].character, 'D', 'D is second (Z is too easy)');
    });
});
