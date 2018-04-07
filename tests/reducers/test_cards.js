import { DECK_NEW, MATCH_PAIRS, MATCH_SOUND } from './../../src/constants';
import { getHardCards, getKnownCards, getUnknownCards,
    pickCardsForGame
} from './../../src/reducers/cards';
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
    it('pickCardsForGame (chooses the right number of cards based on game)', () => {
        const rating = 0;
        const wordLength = 0;
        const cards =  [
            { character: 'A', rating, wordLength },
            { character: 'B', rating, wordLength },
            { character: 'C', rating, wordLength },
            { character: 'D', rating, wordLength },
            { character: 'E', rating, wordLength },
            { character: 'F', rating, wordLength },
            { character: 'G', rating, wordLength },
            { character: 'H', rating, wordLength },
            { character: 'I', rating, wordLength },
            { character: 'J', rating, wordLength },
            { character: 'K', rating, wordLength }
        ];
        const words = cards;
        const answers = {};
        const deck = DECK_NEW;
        const matchPairCards = pickCardsForGame(cards,
            { game: MATCH_PAIRS, answers, deck, words }
        );
        const matchSoundCards = pickCardsForGame(cards,
            { game: MATCH_SOUND, answers, deck, words }
        );
        assert.equal(
            matchPairCards.length,
            12,
            '12 cards needed for the match pair game'
        );
        assert.equal(
            matchPairCards.filter((card, i) => {
                return matchPairCards.findIndex(
                    otherCard => otherCard.character === card.character
                ) !== i;
            }).length,
            6,
            '6 cards are duplicates'
        );
        assert.equal(
            matchSoundCards.length,
            5,
            '5 cards needed for the match sound game'
        );
        assert.ok(
            matchSoundCards.slice(1).findIndex(
                card => card.character === matchSoundCards[0].character
            ),
            'and the first card is a duplicate of another card'
        );
    });
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
