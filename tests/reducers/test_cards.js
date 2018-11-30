import { DECK_NEW, MATCH_DEFINITION, MATCH_PAIRS, MATCH_SOUND } from './../../src/js/constants';
import {  getHardCards, getKnownCards, getUnknownCards,
    intersection,
    pickCardsForGame, pickCardsFromDeck, revealedFlashcard
} from './../../src/js/reducers/cards';
import assert from 'assert';
import example from './example.json';

const words = [
    { character: '!', pinyin: '!', rating: 24, wordLength: 2 },
    { character: 'A', pinyin: 'A', rating: 24, wordLength: 2 },
    { character: 'B', pinyin: 'B', rating: 24, wordLength: 2 },
    { character: 'c', pinyin: 'c', rating: 24, wordLength: 2 },
    { character: 'Z', pinyin: 'Z', rating: 24, wordLength: 2 },
    { character: 'D', pinyin: 'D', rating: 24, wordLength: 2 },
    { character: 'E', pinyin: 'E', rating: 24, wordLength: 2 },
];

describe('Reducer: cards#intersection', () => {
    [
        [
            [ 1, 2 ], [ 3, 4, 5, 2 ], [ 2 ]
        ],
        [
            [ 1, 2 ], [ 3 ], []
        ]
    ].forEach((test) => {
        assert.deepEqual(intersection(test[0], test[1]), test[2]);
    });
});


describe('Reducer: cards#pickCardsFromDeck (#7: pinyin)', () => {
    const cards = [ '承', '程', '城', '惩', '乘' ].map((character) => {
        return {
            character,
            pinyin: 'chéng'
        };
    });
    const newCards = pickCardsFromDeck(cards, { game: MATCH_SOUND });
    assert.equal(newCards.length, 2, 'duplicate pinyin characters are stripped');
});

describe('Reducer: cards#pickCardsFromDeck (#7: pinyin, answers)', () => {
    const dupes = [ '承', '程', '城', '惩', '乘' ].map((character) => {
        return {
            character,
            pinyin: 'chéng'
        };
    });
    const cards = [
        {
            character: '贪',
            pinyin: 'tān'
        }
    ].concat(dupes);
    const newCards = pickCardsFromDeck(cards, { game: MATCH_SOUND });
    assert.equal(newCards.length, 3,
        'of the answers only 1 is not a duplicate (pinyin) of the others');
});

describe('Reducer: cards#pickCardsFromDeck (#7: english question)', () => {
    const cards = [
        {
            character:'贪',
            translations: ['to covet', 'greedy', 'corrupt']
        },
        {
            character: '承',
            translations: [ 'to bear', 'to carry', 'to hold']
        },
        {
            character: '贪心',
            translations: ['greedy']
        }
    ];
    const newCards = pickCardsFromDeck(cards, { game: MATCH_DEFINITION });
    assert.equal(newCards.length, 3, 'similarly translated characters are stripped');
    assert.ok(
        newCards.slice(1)
            .findIndex(card => card.character === newCards[0].character) > -1,
        'first card duplicated'
    );
});

describe('Reducer: cards#pickCardsFromDeck (#7: english answers)', () => {
    const cards = [
        {
            character: '承',
            translations: [ 'to bear', 'to carry', 'to hold']
        },
        {
            character:'贪',
            translations: ['to covet', 'greedy', 'corrupt']
        },
        {
            character: '贪心',
            translations: ['greedy']
        }
    ];
    const newCards = pickCardsFromDeck(cards, { game: MATCH_DEFINITION });
    assert.equal(newCards.length, 3,
        'similarly translated characters in the answers are stripped');
});

describe('Reducer: cards (revealedFlashcard)', () => {
    const newState = revealedFlashcard(example.cards, {
        type: 'REVEAL-FLASHCARD',
        character: '白',
        correctAnswer: '小心',
        isEnd: false,
        isKnown: false,
        paused: false,
        game: 'match-sound',
        index: 1
    });
    assert.equal(
        newState[1].isKnown,
        false,
        // I don't like the existence/need of this test. Should be fixed inside  GameOneInFour
        'The card is 白 and needs to be marked as wrong.'
    );
});

describe('Reducer: cards', () => {
    it('pickCardsForGame (avoids duplicates)', () => {
        const rating = 0;
        const wordLength = 0;
        const words = [
            { character: '石', pinyin: 'shí', rating, wordLength },
            { character: '十', pinyin: 'shí', rating, wordLength },
            { character: '药', pinyin: 'yào', rating, wordLength },
            { character: '纟', pinyin: 'sī', rating, wordLength },
            { character: '勺', pinyin: 'sháo', rating, wordLength },
        ];
        const cards =  words.slice(0);
        const answers = {};
        const deck = DECK_NEW;
        const matchSoundCards = pickCardsForGame(cards,
            { game: MATCH_SOUND, answers, deck, words }
        );
        assert.equal(
            matchSoundCards.length,
            5,
            '5 cards needed for the match sound game'
        );
        assert.ok(
            matchSoundCards.filter(card => card.character === '十').length === 0,
            'to avoid confusion two cards cannot have the same sound'
        );
    });
    it('pickCardsForGame (chooses the right number of cards based on game)', () => {
        const rating = 0;
        const wordLength = 0;
        const cards =  [
            { character: '石', rating, wordLength },
            { character: '十', rating, wordLength },
            { character: '药', rating, wordLength },
            { character: '纟', rating, wordLength },
            { character: '勺', rating, wordLength },
            { character: '田', rating, wordLength },
            { character: '四', rating, wordLength },
            { character: '白', rating, wordLength },
            { character: '马', rating, wordLength },
            { character: '氵', rating, wordLength },
            { character: '土', rating, wordLength }
        ].map(card => Object.assign({}, card, { pinyin: card.character }));
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
            ) > -1,
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
        const cardsMixed = getHardCards(state, 5);
        assert.equal(cards.length, 4, '4 cards have ratings >= than 0: A, B, and d');
        assert.equal(cardsMixed.length, 5,
            'When a total number of cards is needed we supplement it with the known cards');
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
