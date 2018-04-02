import actionTypes from './actionTypes';
import { getAllCardsWithUserDifficulty } from './helpers/cards';
import { ALLOW_DECK_SELECTION, DECK_NEW,
  MATCH_SOUND
} from './constants';
import { random } from './utils';

export function dismountCurrentGame() {
    return { type: actionTypes.DISMOUNT_GAME };
}

export function switchGame(game) {
    return { type: actionTypes.SWITCH_GAME, game };
}

export function init(userData) {
    return (dispatch, getState) => {
        dispatch({ type: actionTypes.INIT, userData });
        window.requestIdleCallback(() => {
            const words = getAllCardsWithUserDifficulty(userData.answers);
            dispatch({ type: actionTypes.INIT_END, words });
        });
    };
}

export function answerAllCardsInRound( isCorrect ) {
    return { type: actionTypes.CHEAT_ANSWER_ALL, isCorrect };
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
                let followup = { type: actionTypes.START_ROUND };
                const state = getState();
                if ( !ALLOW_DECK_SELECTION ) {
                    // if reviewing new characters change game with 1 in 2 chance
                    if ( state.deck === DECK_NEW ) {
                        if ( random( [1, 2] ) === 2 ) {
                            followup = dismountDeck();
                        }
                    } else if ( state.game === MATCH_SOUND ) {
                        // Since match sound is a short game only change the other games in
                        // 1 in 10 chance
                        if ( random( [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] ) === 5 ) {
                            followup = dismountDeck();
                        }
                    } else {
                        followup = dismountDeck();
                    }
                }
                dispatch(followup);
            }, 1000);
        }
    };
}

export function highlightCharacter( character ) {
    return { type: actionTypes.HIGHLIGHT_CHARACTER, character };
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
