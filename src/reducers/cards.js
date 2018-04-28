import actionTypes from './../actionTypes';
import { MATCH_SOUND, MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    MATCH_DEFINITION,
    DECK_UNKNOWN, DECK_NEW, DECK_KNOWN
} from './../constants';
import { mapCard, shuffle, isCardInGame, freezeCards as freezeCardsHelper } from './../helpers/cards';
import { isTooEasy, knowsWord, getDifficultyRatings } from './../helpers/difficulty-ratings';
import { isMatchOneGame } from './../helpers/game';

function updateCardInCards(cards, character, index, props) {
    return cards.map((card, i) => {
        return character === card.character &&
            (index === i || index === false) ?
            Object.assign({}, card,  props) : card;
    });
}

export function selectAndAnswerAll(state, isKnown) {
    return state.map(card => Object.assign({}, card, { isAnswered: true,
        isSelected: true,
        isKnown }));
}

export function markCardsAsAnswered(state, character, isKnown) {
    return updateCardInCards(state.cards, character, false, { isAnswered: true, isKnown });
}

export function answerCard(state, character, index, isKnown) {
    return updateCardInCards(state, character, index, { isAnswered: true, isKnown });
}

export function deselectUnansweredCards(state) {
    return state.map((card, i) => {
        return card.isSelected && !card.isAnswered ?
            Object.assign({}, card,  { isSelected: false }) : card;
    });
}

export function selectCard(cards, character, index) {
    return updateCardInCards(cards, character, index, { isSelected: true, isFlipped: false });
}
export function addIndexToCards(state) {
    return state.cards.map((card, i) => Object.assign({}, card, { index: i }));
}

export function getUnknownCards(state, total) {
    const ratings = getDifficultyRatings(state);
    const cards = state.words.filter((word) => ratings[word.character] === undefined &&
        isCardInGame(word)
    );

    return cards.slice(0, total)
        .map(word => mapCard(state, word.character));
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

/**
 * If the number of hard cards is less than the total, then cards
 * will be added from unknown cards and then available cards.
 */
export function getHardCards(state, total) {
    const ratings = getDifficultyRatings(state);
    let available = state.words.filter((word) => {
        const char = word.character;
        return ratings[char] !== undefined && !knowsWord(ratings, char)
    } );
    if ( available.length < total ) {
       available = available.concat(
           getUnknownCards(state, total - available.length )
       );
    }
    if ( available.length < total ) {
       available = available.concat(
           getKnownCards(state, total - available.length )
       );
    }
    return shuffle(
            available
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
            cards = getKnownCards(state, 9);
            break;
        default:
            break;
    }
    return cards;
}

export function pickCardsForGame( _cards, action ) {
    let cards = chooseDeck( _cards, action );
    // Pick card to play the game with
    const card = cards[0];
    switch (action.game) {
        case MATCH_SOUND:
            const x = 1;
            // Move out any duplicate sounds to avoid duplicate answers
            cards = cards.filter((c, i) => c.character === card.character ||
                c.pinyin !== card.pinyin);
        case MATCH_DEFINITION:
        case MATCH_SOUND:
            // 4 cards will be used in the game.
            cards = cards.slice(0, 4);
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
    return addIndexToCards({ cards: shuffle(state.cards) });
}

export function resetCards(cards) {
    return cards.map(card => {
        return Object.assign({}, card, { isFlipped: false, isAnswered: false, isSelected: true });
    });
}

export function flipCards(state) {
    return state.map(card => {
        if ( card.isAnswered ) {
            return card;
        } else {
            return Object.assign({}, card, { isFlipped: true, isSelected: false });
        }
    });
}

// Reducer for when a card is answered
function actionAnswerCard(state, action) {
    const char = action.character;
    let isKnown = true;

    return answerCard(state, char, action.index, isKnown);
}

function newRound(cards, action) {
    const game = action.game;
    const answers = action.answers;
    const words = action.words;
    const deck = action.deck;
    return addIndexToCards(
        {
            cards: pickCardsForGame( cards, { game, answers, words, deck } )
        }
    );
}

function revealCardInAction(cards, action) {
    return selectCard(cards, action.character, action.index);
}

function revealedFlashcard(state, action) {
    if ( action.paused ) {
        return state;
    } else if (isMatchOneGame(action.game)) {
        return revealCardInAction(
            markCardsAsAnswered({ cards: state }, action.character, action.isKnown),
            action
        );
    }  else {
        return revealCardInAction(state, action);
    }
}

function resetCurrentDeck(cards, action) {
    switch (action.game) {
        case PINYIN_TO_CHINESE:
        case ENGLISH_TO_CHINESE:
        case MATCH_PAIRS:
            return shuffleCards({ cards: resetCards(cards) });
            break;
        default:
            console.log('resetCurrentDeck is a noop if not the game');
            break;
    }
    return cards;
}

export default (state=[], action) => {
    switch (action.type) {
        case actionTypes.RESET_CURRENT_DECK:
            return resetCurrentDeck(state, action);
        case actionTypes.REVEAL_FLASHCARD:
            return revealedFlashcard(state, action);
        case actionTypes.START_ROUND:
            return newRound(state, action);
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return actionAnswerCard(state, action);
        case actionTypes.CHEAT_ANSWER_ALL:
            let cards;
            state.forEach((card) =>
                cards = actionAnswerCard(state, {
                    type: action.isCorrect ?
                        actionTypes.GUESS_FLASHCARD_RIGHT :
                        actionTypes.GUESS_FLASHCARD_WRONG,
                    character: card.character
                })
            );
            return selectAndAnswerAll(cards, false);
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return deselectUnansweredCards(state);
        case actionTypes.FLIP_CARDS_END:
            return flipCards(state);
        case actionTypes.END_ROUND:
            return freezeCardsHelper( state );
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
