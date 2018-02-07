import actionTypes from './actionTypes';
import { getOrderedCards } from './helpers/cards';

export function dismountCurrentGame() {
    return { type: actionTypes.DISMOUNT_GAME };
}

export function switchGame(game) {
    return { type: actionTypes.SWITCH_GAME, game };
}

export function clickRootNode() {
    return { type: actionTypes.CLICK_ROOT_NODE };
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

export function timedAction(type, milliseconds) {
    return (dispatch, getState) => {
        setTimeout(() => {
            const action = typeof type === 'string' ? { type } : type();
            dispatch(action);
        }, milliseconds);
        dispatch({ type: actionTypes.CLEAR_TIMED_ACTION });
    };
}

export function flipCardsAfter(milliseconds) {
    return (dispatch, getState) => {
        setTimeout(() => {
            dispatch({ type: actionTypes.FLIP_CARDS_END });
        }, milliseconds);
        dispatch({ type: actionTypes.FLIP_CARDS_START });
    };
}

export function startRound() {
    return { type: actionTypes.START_ROUND };
}

export function endRound() {
    return { type: actionTypes.END_ROUND };
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
