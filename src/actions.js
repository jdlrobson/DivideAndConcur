import actionTypes from './actionTypes';
import { getAllCardsWithUserDifficulty, getAnsweredCards } from './helpers/cards';
import { getKnownWordCount, getUnKnownWordCount } from './helpers/difficulty-ratings';
import { ALLOW_DECK_SELECTION, DECK_NEW, DECK_UNKNOWN, DECK_KNOWN, FLIP_DELAY } from './constants';
import { random } from './utils';
import { isMatchOneGame } from './helpers/game';

export function renderComplete() {
    return { type: actionTypes.RENDER_COMPLETE };
}

export function dismountCurrentGame() {
    return { type: actionTypes.DISMOUNT_GAME };
}

export function switchGame(game) {
    return { type: actionTypes.SWITCH_GAME, game };
}

export function init(userData) {
    const cleanWordOrder = process.env.CLEAN_WORD_ORDER !== undefined;
    return (dispatch) => {
        dispatch({ type: actionTypes.INIT, userData });
        window.requestIdleCallback(() => {
            const answers = userData.answers;
            const words = getAllCardsWithUserDifficulty(answers);
            dispatch({ type: actionTypes.INIT_END,
                words,
                answers,
                cleanWordOrder });
        });
    };
}

export function showOverlay(character) {
    return { type: actionTypes.SHOW_OVERLAY, character };
}

export function hideOverlay() {
    return { type: actionTypes.HIDE_OVERLAY };
}

export function answerAllCardsInRound(isCorrect, cards) {
    return { type: actionTypes.CHEAT_ANSWER_ALL, isCorrect, cards };
}

export function flipCardsAfter(milliseconds) {
    return (dispatch, getState) => {
        if (!getState().isFlipping) {
            const interval = setInterval(() => {
                dispatch({ type: actionTypes.COUNT_DOWN });
            }, 1000);
            setTimeout(() => {
                clearInterval(interval);
                dispatch({ type: actionTypes.FLIP_CARDS_END });
            }, milliseconds);
            dispatch({ type: actionTypes.FLIP_CARDS_START,
                countdown: parseInt(milliseconds / 1000, 10) });
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
    return (dispatch, getState) => {
        function waitAndStart() {
            const state = getState();
            const { game, deck, answers, words, paused } = state;

            if (!paused) {
                dispatch({ type: actionTypes.START_ROUND, deck, game, answers, words });
            } else {
                // try again in 1s.
                setTimeout(waitAndStart, 1000);
            }
        }
        waitAndStart();
    };
}

export function refresh() {
    return (dispatch, getState) => {
        const game = getState().game;
        dispatch({ type: actionTypes.RESET_CURRENT_DECK, game });
        flipCardsAfter(FLIP_DELAY)(dispatch, getState);
    };
}

export function resetNumRounds() {
    return { type: actionTypes.RESET_ROUNDS };
}

export function endRound(callback) {
    callback = callback || setTimeout;
    return (dispatch, getState) => {
        const state = getState();
        const cards = state.cards;
        const game = state.game;
        if (!state.endRound) {
            dispatch({ type: actionTypes.END_ROUND, cards, game });

            callback(() => {
                let followup = startRound();
                const state = getState();
                if (!ALLOW_DECK_SELECTION) {
                    const unknown = getUnKnownWordCount(state.answers);
                    const known = getKnownWordCount(state.answers);
                    if (state.deck === DECK_KNOWN && known === 0) {
                        followup = dismountDeck();
                    } else if (state.deck === DECK_UNKNOWN && unknown === 0) {
                        followup = dismountDeck();
                    } else if (state.deck === DECK_NEW) {
                        // If the user has more unknown words than known,
                        // stop giving them new cards!
                        if (unknown < known || state.words.length === unknown + known) {
                            followup = dismountDeck();
                        } else if (random([1, 2]) === 2) {
                            followup = dismountDeck();
                        }
                    } else if (isMatchOneGame(state.game)) {
                        // Since match sound is a short game only change the other games in
                        // 1 in 10 chance
                        if (random([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) === 5) {
                            followup = dismountDeck();
                        }
                    } else {
                        followup = dismountDeck();
                    }
                }
                dispatch(followup);
            }, 3000);
        }
    };
}

export function highlightCharacter(character) {
    return { type: actionTypes.HIGHLIGHT_CHARACTER, character };
}

export function saveComplete() {
    return { type: actionTypes.SAVE_COMPLETE };
}

export function revealFlashcard(character, index) {
    return (dispatch, getState) => {
        const state = getState();
        const isEnd = getAnsweredCards(state).length === 1;
        const paused = state.paused;
        const game = state.game;
        const isKnown = state.cards[0].character === character;
        const isRealWord = state.words.findIndex(word => word.character === character) > -1;
        const correctAnswer = state.cards[0].character;
        dispatch({
            type: actionTypes.REVEAL_FLASHCARD,
            character,
            isRealWord,
            correctAnswer,
            isEnd,
            isKnown,
            paused,
            game,
            index
        });
    };
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
