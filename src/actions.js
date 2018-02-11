import actionTypes from './actionTypes';
import { getOrderedCards } from './helpers/cards';

export function dismountCurrentGame() {
    return { type: actionTypes.DISMOUNT_GAME };
}

export function switchGame(game) {
    return { type: actionTypes.SWITCH_GAME, game };
}

export function init(userData) {
    return (dispatch, getState) => {
        dispatch({ type: actionTypes.INIT, userData });
        setTimeout(() => {
            const words = getOrderedCards(userData.answers);
            dispatch({ type: actionTypes.INIT_END, words });
        }, 0);
    };
}

export function answerAllCardsInRound() {
    return { type: actionTypes.CHEAT_ANSWER_ALL };
}

export function flipCardsAfter(milliseconds) {
    return (dispatch, getState) => {
        if ( !getState().isFlipping ) {
            setTimeout(() => {
                dispatch({ type: actionTypes.FLIP_CARDS_END });
            }, milliseconds);
            dispatch({ type: actionTypes.FLIP_CARDS_START });
        }
    };
}

export function setDeck(deck) {
    return { type: actionTypes.SET_DECK, deck };
}

export function dismountDeck() {
    return { type: actionTypes.DISMOUNT_DECK };
}

export function startRound() {
    return { type: actionTypes.START_ROUND };
}

export function endRound() {
    return (dispatch, getState) => {
        if (!getState().endRound) {
            dispatch({ type: actionTypes.END_ROUND });
            setTimeout(() => {
                dispatch({ type: actionTypes.START_ROUND });
            }, 1000);
        }
    };
}

export function saveComplete() {
    return { type: actionTypes.SAVE_COMPLETE };
}

export function revealFlashcard(character, index) {
    return { type: actionTypes.REVEAL_FLASHCARD,
        character,
        index };
}

export function answerFlashcard(isCorrect, character, index) {
    const type = isCorrect ? actionTypes.GUESS_FLASHCARD_RIGHT
        : actionTypes.GUESS_FLASHCARD_WRONG;

    return {
        type,
        character,
        index
    };
}
