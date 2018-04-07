import actionTypes from './../actionTypes';
import { MATCH_SOUND, MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    DECK_UNKNOWN, DECK_NEW, DECK_KNOWN
} from './../constants';
import { mapCard, shuffle, isCardInGame, freezeCards as freezeCardsHelper } from './../helpers/cards';
import { isTooEasy, knowsWord, getDifficultyRatings } from './../helpers/difficulty-ratings';

function updateCardInCards(cards, character, index, props) {
    return cards.map((card, i) => {
        return character === card.character &&
            (index === i || index === false) ?
            Object.assign({}, card,  props) : card;
    });
}

export function selectAndAnswerAll(state, isKnown) {
    return state.cards.map(card => Object.assign({}, card, { isAnswered: true,
        isSelected: true,
        isKnown }));
}

export function markCardsAsAnswered(state, character, isKnown) {
    return updateCardInCards(state.cards, character, false, { isAnswered: true, isKnown });
}

export function answerCard(state, character, index, isKnown) {
    return updateCardInCards(state.cards, character, index, { isAnswered: true, isKnown });
}

export function deselectUnansweredCards(state) {
    const cards = state.cards;
    return cards.map((card, i) => {
        return card.isSelected && !card.isAnswered ?
            Object.assign({}, card,  { isSelected: false }) : card;
    });
}

export function selectCard(state, character, index) {
    return updateCardInCards(state.cards, character, index, { isSelected: true, isFlipped: false });
}
export function addIndexToCards(state) {
    return state.cards.map((card, i) => Object.assign({}, card, { index: i }));
}

export function freezeCards(state) {
    return freezeCardsHelper(state.cards);
}

export function getUnknownCards(state, total) {
    const ratings = getDifficultyRatings(state);
    const cards = state.words.filter((word) => ratings[word.character] === undefined &&
        isCardInGame(word)
    );

    return cards.slice(0, total);
}

export function cloneCards(state) {
    return state.cards.concat(state.cards);
}

export function getKnownCards(state, total) {
    const ratings = getDifficultyRatings(state);
    return shuffle(
        state.words.filter(word => knowsWord(ratings, word.character))
            .filter(isCardInGame)
            .map(word => mapCard(state, word.character))
    );
}

export function getHardCards(state, total) {
    const ratings = getDifficultyRatings(state);
    return shuffle(
            state.words.filter((word) => {
                const char = word.character;
                return ratings[char] !== undefined && !knowsWord(ratings, char)
            } )
        ).slice(0, total)
        .map(word => mapCard(state, word.character));
}

function chooseDeck( _cards, action ) {
    let cards = [];
    const state = { words: action.words, answers: action.answers };
    switch (action.deck) {
        case DECK_UNKNOWN:
            cards = getHardCards(state, 9);
            break;
        case DECK_NEW:
            cards = getUnknownCards(state, 9);
            break;
        case DECK_KNOWN:
            cards = getKnownCards(state);
            break;
        default:
            break;
    }
    return cards;
}

export function pickCardsForGame( _cards, action ) {
    let cards = chooseDeck( _cards, action );
    switch (action.game) {
        case MATCH_SOUND:
            // 4 cards will be used in the game.
            cards = cards.slice(0, 4);

            // Pick card to play the game with
            const card = cards[0];
            // shuffle them again
            cards = shuffleCards({ cards });
            // add the goal card at the front
            cards.unshift(card);
            break;
        case PINYIN_TO_CHINESE:
        case ENGLISH_TO_CHINESE:
        case MATCH_PAIRS:
            cards = cutCardDeck({ cards }, 6);
            cards = cloneCards({ cards });
            cards = shuffleCards({ cards });
            break;
        default:
            cards = shuffleCards({ cards });
            break;
    }
    return cards;
};

export function cutCardDeck(state, total) {
    return state.cards.slice(0,total);
}

export function shuffleCards(state) {
    return shuffle(state.cards);
}

export function flipCards(state) {
    return state.cards.map(card => {
        if ( card.isAnswered ) {
            return card;
        } else {
            return Object.assign({}, card, { isFlipped: true, isSelected: false });
        }
    });
}

export default (state=[], action) => {
    switch (action.type) {
        case actionTypes.INIT_END:
            // Load known cards into cache
            const words = action.words;
            const answers = action.answers;
            getKnownCards( Object.assign( {}, state, { words, answers } ) );
            break;
        default:
            break;
    }

    return state;
};
