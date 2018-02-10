/** @jsx h */
import { MATCH_SOUND, FLIP_CARDS, MATCH_PAIRS, MATCH_PAIRS_REVISE,
    REVISE } from './constants';
import { getDifficultyRatings } from './helpers/difficulty-ratings';
import { shuffle, getSelectedUnansweredCards, getAnsweredCards,
    dictUtils,
    makeCardsFromCharacters  } from './helpers/cards';
import { getUnknownCards, getKnownCards,
    flipCards, cloneCards, answerCard,
    freezeCards, selectAndAnswerAll,
    selectCard, deselectUnansweredCards, markCardsAsAnswered,
    cutCardDeck, shuffleCards, addIndexToCards } from './reducers/cards';
import { markWordAsDifficult, markWordAsEasy } from './reducers/difficulty-ratings';
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
    const card = state.card;
    const isEnd = getAnsweredCards(state).length === state.goal.length;
    const char = action.character;
    const isKnown = state.goal.indexOf(char) > -1;
    let answers = getDifficultyRatings(state);
    let cards = state.cards;

    if (!isEnd) {
        if (isKnown) {
            answers = markWordAsEasy(state, char);
            // If the word is of length > 1 also mark the parent
            if (state.goal.indexOf(card.character) === -1) {
                markWordAsEasy(state, card.character);
            }
        } else {
            answers = markWordAsDifficult(state, char);
        }
        // Mark selected card as answered
        cards = markCardsAsAnswered(state, action.character, isKnown);
    }

    return Object.assign({}, state, { answers, cards });
}
function revealedFlashcard(state, action) {
    if (state.game === MATCH_SOUND) {
        return revealFlashcardDecompose(state, action);
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

function newRound(state) {
    let cards = [];

    if (state.game === MATCH_PAIRS) {
        cards = getUnknownCards(state, 6);
    } else if (state.game === MATCH_PAIRS_REVISE) {
        cards = getKnownCards(state);
        cards = shuffleCards({ cards });
        cards = cutCardDeck({ cards }, 6);
    } else if (state.game === FLIP_CARDS) {
        cards = getUnknownCards(state, 9);
    } else if (state.game === REVISE) {
        cards = getKnownCards(state);
        cards = shuffleCards({ cards });
        cards = cutCardDeck({ cards }, 9);
    } else if (state.game === MATCH_SOUND) {
        // get a word which is composed of other words
        const card = getUnknownCards(state, 1)[0];
        const goal = [card.character];
        const randomRadicals = shuffle(
            dictUtils.getWords(0)
                .filter(char => goal.indexOf(char) === -1 && ['⺶','𥫗', '⺮'].indexOf(char) === -1)
        ).slice(0, 5);
        cards = makeCardsFromCharacters(state, shuffle(goal.concat(randomRadicals)));

        state = Object.assign({},
            state,
            {
                card,
                goal
            });
    }

    switch (state.game) {
        case MATCH_PAIRS:
        case MATCH_PAIRS_REVISE:
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
    state = Object.assign({}, state, { paused, highlighted });
    switch (action.type) {
        case actionTypes.CHEAT_ANSWER_ALL:
            return Object.assign({}, state, {
                cards: selectAndAnswerAll(state)
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

