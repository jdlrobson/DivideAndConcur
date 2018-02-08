/** @jsx h */
import { MATCH_SOUND, FLIP_CARDS, MATCH_PAIRS, MATCH_PAIRS_REVISE,
    REVISE } from './constants';
import { getKnownWordCount, getDifficultyRatings } from './helpers/difficulty-ratings';
import { getUnknownCards } from './reducers/cards';
import { markWordAsDifficult, markWordAsEasy } from './reducers/difficulty-ratings';
import actionTypes from './actionTypes';
import {
    dictUtils,
    dealKnownCards,
    addHighlightedCards,
    makeCardsFromCharacters } from './helpers/cards';

// clears the current overlay
function clearOverlay(state) {
    return Object.assign({}, state, {
        overlay: null
    });
}

// Reducer for when a card is answered
function actionAnswerCard(state, action) {
    const char = action.character;
    const isAnswered = true;
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

    return addHighlightedCards(Object.assign({}, state, {
        answers,
        cards: updateCardInCards(state.cards, action, { isAnswered, isKnown }),
        previous: state.previous
    }), char);
}

function addKnownWordCount(state) {
    const knownWordCount = getKnownWordCount(getDifficultyRatings(state));
    return Object.assign({}, state, { knownWordCount });
}

function setGame(state, action) {
    return newRound(Object.assign({}, state, {
        game: action.game,
        highlighted: [],
        previous: [],
        cards: []
    }));
}

function updateCardInCards(cards, action, props) {
    return cards.map((card, i) => {
        return action.character === card.character &&
          action.index === i ?
            Object.assign({}, card,  props) : card;
    });
}

function markCardsAsAnswered(cards, character, isKnown) {
    return cards.map((card, i) => {
        return character === card.character ?
            Object.assign({}, card,  { isAnswered: true, isKnown }) : card;
    });
}

function deselectUnansweredCards(cards) {
    return cards.map((card, i) => {
        return card.isSelected && !card.isAnswered ?
            Object.assign({}, card,  { isSelected: false }) : card;
    });
}

function resumePlay(state) {
    return Object.assign({}, state, { isPaused: false });
}

function pausePlay(state) {
    return Object.assign({}, state, { isPaused: true });
}

function addTimedAction(state, timedAction, timedActionDuration) {
    return pausePlay(Object.assign({}, state, {
        timedAction,
        timedActionDuration })
    );
}

function queueDeselectOfUnansweredCards(state) {
    return addTimedAction(state, actionTypes.DESELECT_ALL_UNANSWERED_CARDS, 2000);
}

function actionDeselectUnansweredCards(state) {
    return resumePlay(
        Object.assign({}, state, {
            cards: deselectUnansweredCards(state.cards)
        })
    );
}

function revealCardInAction(state, action) {
    return Object.assign({}, state, {
        cards: updateCardInCards(state.cards, action, { isSelected: true })
    });
}

function revealedFlashcardPairGame(state, action) {
    state = revealCardInAction(state, action);
    const selectedCards = state.cards.filter(card => card.isSelected && !card.isAnswered);
    if (selectedCards.length === 2) {
        if (selectedCards[0].character === selectedCards[1].character) {
            const char = action.character;
            const answers = markWordAsEasy(state, char);
            const cards = markCardsAsAnswered(state.cards, char, true);
            return addHighlightedCards(Object.assign({}, state, { cards, answers }), char);
        } else {
            return queueDeselectOfUnansweredCards(pausePlay(state));
        }
    }
    return state;
}

function revealFlashcardDecompose(state, action) {
    let cards = state.cards;
    const card = state.card;
    const isEnd = cards.filter(card => card.isAnswered).length === state.goal.length;
    const char = action.character;
    const isKnown = state.goal.indexOf(char) > -1;
    let answers = getDifficultyRatings(state);


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
        cards = updateCardInCards(state.cards, action, {
            isAnswered: true,
            answers,
            isKnown
        });
    }

    return addHighlightedCards(
        Object.assign({}, state, { answers, cards }),
        char
    );
}
function revealedFlashcard(state, action) {
    if (state.game === MATCH_SOUND) {
        return revealFlashcardDecompose(state, action);
    } else if (state.game === MATCH_PAIRS || state.game === MATCH_PAIRS_REVISE) {
        return revealedFlashcardPairGame(state, action);
    }  else {
        return revealCardInAction(state, action);
    }
}

function shuffle(arr) {
    return arr.sort((a,b) => { return Math.random() < 0.5 ? -1 : 1; });
}

function shuffleCards(state) {
    return Object.assign({}, state, {
        cards: shuffle(state.cards)
    });
}
function cloneCards(state) {
    const cards = state.cards;
    return Object.assign({}, state, {
        cards: cards.concat(cards)
    });
}

function addIndexToCards(state) {
    return Object.assign({}, state, {
        cards: state.cards.map((card, i) => Object.assign({}, card, { index: i }))
    });
}

function requestSave(state) {
    return Object.assign({}, state, { isDirty: true });
}
function saveDone(state) {
    return Object.assign({}, state, { isDirty: false });
}

function cutCardDeck(state, total) {
    const cards = state.cards.slice(0,total);
    return Object.assign({}, state, { cards });
}

function newRound(state) {
    let cards = [];
    state = addKnownWordCount(state);

    if (state.game === MATCH_PAIRS) {
        cards = getUnknownCards(state, 6);
    } else if (state.game === MATCH_PAIRS_REVISE) {
        state = cutCardDeck(shuffleCards(dealKnownCards(state)), 6);
    } else if (state.game === FLIP_CARDS) {
        cards = getUnknownCards(state, 9);
    } else if (state.game === REVISE) {
        state = cutCardDeck(shuffleCards(dealKnownCards(state)), 9);
    } else if (state.game === MATCH_SOUND) {
        // get a word which is composed of other words
        const card = getUnknownCards(state, 1)[0];
        const goal = [card.character];
        const randomRadicals = shuffle(dictUtils.getWords(0)
        .filter(char => goal.indexOf(char) === -1)
        ).slice(0, 7);
        cards = makeCardsFromCharacters(state, shuffle(goal.concat(randomRadicals)));

        state = Object.assign({},
            state,
            {
                card,
                goal
            });
    }
    state = Object.assign({}, state, { cards });

    switch (state.game) {
        case MATCH_PAIRS:
        case MATCH_PAIRS_REVISE:
            state = flipCardStart(shuffleCards(cloneCards(state)));
            break;
        default:
            break;
    }

    return requestSave(addIndexToCards(state));
}
function flipCards(state) {
    const cards = state.cards.map(card => Object.assign({}, card,
        { isFlipped: true, isSelected: false }));
    return Object.assign({}, state, { cards, isFlipped: true });
}

function flipCardStart(state, action) {
    return Object.assign({}, state, { isFlipped: false });
}

export default (state, action) => {
    switch (action.type) {
        case actionTypes.INIT:
            return { isBooted: false, answers: action.userData.answers };
        case actionTypes.INIT_END:
            return addKnownWordCount(
                Object.assign({}, state, { isBooted: true, words: action.words })
            );
        case actionTypes.FLIP_CARDS_START:
            return pausePlay(flipCardStart(state, action));
        case actionTypes.FLIP_CARDS_END:
            return resumePlay(flipCards(state));
        case actionTypes.SAVE_COMPLETE:
            return saveDone(state);
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return actionDeselectUnansweredCards(state, action);
        case actionTypes.CLEAR_TIMED_ACTION:
            return Object.assign({}, state, { timedAction: undefined,
                timedActionDuration: undefined });
        case actionTypes.END_ROUND:
        case actionTypes.START_ROUND:
            return newRound(state);
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return actionAnswerCard(state, action);
        default:
            break;
    }
    // All these actions are user driven and will not work if paused.
    if (!action.isPaused) {
        switch (action.type) {
            case actionTypes.DISMOUNT_GAME:
                return setGame(state, { game: false });
            case actionTypes.REVEAL_FLASHCARD:
                return state.isPaused ? state : revealedFlashcard(state, action);
            case actionTypes.SWITCH_GAME:
                return setGame(state, action);
            case actionTypes.GUESS_FLASHCARD_WRONG:
            case actionTypes.GUESS_FLASHCARD_RIGHT:
                return actionAnswerCard(state, action);
            case actionTypes.CLICK_ROOT_NODE:
                return clearOverlay(state);
            default:
                break;
        }
    }
    return state;
};

