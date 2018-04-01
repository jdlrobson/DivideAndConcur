/** @jsx h */
import { MATCH_SOUND, MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    DECK_NEW, DECK_KNOWN, DECK_UNKNOWN,
} from './constants';
import { getDifficultyRatings } from './helpers/difficulty-ratings';
import { shuffle, getSelectedUnansweredCards, getAnsweredCards,
    dictUtils,
    makeCardsFromCharacters  } from './helpers/cards';
import { getUnknownCards, getKnownCards, getHardCards,
    flipCards, cloneCards, answerCard,
    freezeCards, selectAndAnswerAll,
    selectCard, deselectUnansweredCards, markCardsAsAnswered,
    cutCardDeck, shuffleCards, addIndexToCards } from './reducers/cards';
import { markWordAsDifficult, markWordAsEasy } from './reducers/difficulty-ratings';
import _deck from './reducers/deck';
import _highlighted from './reducers/highlighted';
import _paused from './reducers/paused';
import actionTypes from './actionTypes';

// Reducer for when a card is answered
function actionAnswerCard(state, action) {
    const char = action.character;
    let isKnown = true;
    let answers;

    switch (action.type) {
        case actionTypes.GUESS_FLASHCARD_WRONG:
            answers = markWordAsDifficult(state, char);
            isKnown = false;
            break;
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            answers = markWordAsEasy(state, char);
            break;
        default:
            break;
    }

    const cards = answerCard(state, char, action.index, isKnown);
    return Object.assign({}, state, {
        answers,
        cards
    });
}

function setGame(state, action) {
    return Object.assign({}, state, {
        game: action.game
    });
}

function actionDeselectUnansweredCards(state) {
    return Object.assign({}, state, {
        cards: deselectUnansweredCards(state)
    });
}

function revealCardInAction(state, action) {
    const cards = selectCard(state, action.character, action.index);
    return Object.assign({}, state, {
        cards
    });
}

function revealFlashcardDecompose(state, action) {
    const card = state.cards[0];
    const isEnd = getAnsweredCards(state).length === 1;
    const char = action.character;
    const isKnown = card.character === char;
    let answers = getDifficultyRatings(state);
    let cards = state.cards;

    if (!isEnd) {
        if (isKnown) {
            answers = markWordAsEasy(state, char);
        } else {
            answers = markWordAsDifficult(state, char);
        }
    }
    // Mark selected card as answered
    cards = markCardsAsAnswered(state, action.character, isKnown);

    return Object.assign({}, state, { answers, cards });
}
function revealedFlashcard(state, action) {
    if (state.game === MATCH_SOUND) {
        return revealCardInAction(revealFlashcardDecompose(state, action), action);
    }  else {
        return revealCardInAction(state, action);
    }
}

function requestSave(state) {
    return Object.assign({}, state, { isDirty: true });
}
function saveDone(state) {
    return Object.assign({}, state, { isDirty: false });
}

function chooseDeck(state) {
    let cards = [];
    switch (state.deck) {
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
function newRound(state) {
    let cards = chooseDeck(state, )
    cards = shuffleCards({ cards });

    switch (state.game) {
        case MATCH_SOUND:
            // The first word will be the one we guess the sound for.
            // exclude some words we know don't have pinyin
            cards = cards.filter(card => ['⺶','𥫗', '⺮'].indexOf(card.character) === -1)
                .slice(0, 5);

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
            state = Object.assign({}, state, { cards, isFlipped: false });
            break;
        default:
            break;
    }
    const previous = getKnownCards(state).slice(-50).reverse();
    return Object.assign({}, state, { cards: addIndexToCards({ cards }), previous });
}

function flipCardStart(state, action) {
    return Object.assign({}, state, { isFlipped: false, isFlipping: true });
}

export default (state={}, action) => {
    const highlighted = _highlighted(state.highlighted, action);
    const paused = _paused(state.paused, action);
    const deck = _deck(state.deck, action);
    state = Object.assign({}, state, { paused, highlighted, deck });
    switch (action.type) {
        case actionTypes.CHEAT_ANSWER_ALL:
            state.cards.forEach((card) =>
                actionAnswerCard(state, {
                    type: actionTypes.GUESS_FLASHCARD_WRONG,
                    character: card.character
                })
            );
            return Object.assign({}, state, {
                cards: selectAndAnswerAll(state, false)
            });
        case actionTypes.INIT:
            return { isBooted: false, answers: action.userData.answers };
        case actionTypes.INIT_END:
            return Object.assign({}, state, { isBooted: true, words: action.words });
        case actionTypes.FLIP_CARDS_START:
            return flipCardStart(state, action);
        case actionTypes.FLIP_CARDS_END:
            return Object.assign({}, state, { isFlipped: true, isFlipping: false,
                cards: flipCards(state) }
            );
        case actionTypes.SAVE_COMPLETE:
            return saveDone(state);
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return actionDeselectUnansweredCards(state, action);
        case actionTypes.END_ROUND:
            return requestSave(
                Object.assign({}, state, { cards: freezeCards(state), endRound: true })
            );
        case actionTypes.START_ROUND:
            return Object.assign({}, newRound(state), { endRound: false });
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return actionAnswerCard(state, action);
        default:
            break;
    }
    // All these actions are user driven and will not work if paused.
    if (!paused) {
        switch (action.type) {
            case actionTypes.DISMOUNT_DECK:
            case actionTypes.DISMOUNT_GAME:
                return setGame(state, { game: false });
            case actionTypes.REVEAL_FLASHCARD:
                return revealedFlashcard(state, action);
            case actionTypes.SWITCH_GAME:
                return setGame(state, action);
            case actionTypes.GUESS_FLASHCARD_WRONG:
            case actionTypes.GUESS_FLASHCARD_RIGHT:
                return actionAnswerCard(state, action);
            default:
                break;
        }
    }
    return state;
};

