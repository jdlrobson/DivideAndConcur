import actionTypes from './../actionTypes';
import { getDifficultyRatings } from './../helpers/difficulty-ratings';
import { getUnknownCards } from './cards';
import { isMatchOneGame } from './../helpers/game';

export function markWordAsEasy(state, char) {
    const difficultyRatings = getDifficultyRatings(state);
    const newRating = difficultyRatings[char] !== undefined ? difficultyRatings[char] - 1 : 0;
    difficultyRatings[char] = Math.max(-5, newRating);
    return Object.assign({}, difficultyRatings);
}

export function markWordAsDifficult(state, char) {
    const difficultyRatings = getDifficultyRatings(state);
    const newRating = difficultyRatings[char] !== undefined ? difficultyRatings[char] + 1 : 1;
    difficultyRatings[char] = Math.min(5, newRating);

    return Object.assign({}, difficultyRatings);
}

export function clean(state, action) {
    const words = action.words;
    const nextWord = getUnknownCards({ answers: state, words }, 1)[0];
    const maxWordLength = nextWord.wordLength;
    const maxDifficulty = nextWord.rating;
    const nextIndex = words.findIndex(word => word.character === nextWord.character);

    Object.keys(state).forEach((char) => {
        const wordPos = words.findIndex(word => word.character === char);
        // Delete words that have been dropped from the dictionary but were previously answered
        if (wordPos === -1) {
            delete state[char];
        } else if (action.cleanWordOrder && wordPos > nextIndex) {
            // If the word being looked at comes after the next card than it needs to be dropped
            delete state[char];
        } else if (action.cleanWordOrder) {
            // Cleanup words which are more difficulty then the next known word
            // (ratings sometimes change)
            const w = words[wordPos];
            if (w.wordLength > maxWordLength && action.cleanWordOrder) {
                delete state[char];
            } else if (w.wordLength === maxWordLength && w.rating > maxDifficulty) {
                delete state[char];
            }
        }
    });
    return Object.assign({}, state);
}

function actionAnswerUpdate(answers, action) {
    const char = action.character;

    switch (action.type) {
        case actionTypes.GUESS_FLASHCARD_WRONG:
            return markWordAsDifficult({ answers }, char);
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return markWordAsEasy({ answers }, char);
        default:
            return answers;
    }
}

export function revealedFlashcard(state, action) {
    if (!action.paused && isMatchOneGame(action.game)) {
        if (!action.isEnd) {
            if (action.isKnown) {
                return markWordAsEasy({
                    answers: Object.assign({}, state)
                }, action.character);
            } else {
                // If wrong mark both as difficult to push them back on the learning stack
                // mark what was the correct answer as wrong
                if (action.correctAnswer) {
                    state = markWordAsDifficult({
                        answers: Object.assign({}, state)
                    }, action.correctAnswer);
                }
                const answerChars = Array.from(action.correctAnswer || '');
                const uniqueChars = Array.from(action.character)
                    .filter(char => answerChars.indexOf(char) === -1);
                return uniqueChars.length === 1 ?
                    // Mark the shared characters as difficult
                    markWordAsDifficult({
                        answers: Object.assign({}, state)
                    }, uniqueChars.join(''))
                    : state;
            }
        } else {
            return state;
        }
    } else {
        return state;
    }
}

export default (state = {}, action) => {
    let answers;
    switch (action.type) {
        case actionTypes.REVEAL_FLASHCARD:
            return revealedFlashcard(state, action);
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return actionAnswerUpdate(state, action);
        case actionTypes.CHEAT_ANSWER_ALL:
            action.cards.forEach((card) => {
                answers = actionAnswerUpdate(state, {
                    type: action.isCorrect ?
                        actionTypes.GUESS_FLASHCARD_RIGHT :
                        actionTypes.GUESS_FLASHCARD_WRONG,
                    character: card.character
                });
            });
            return answers;
        case actionTypes.INIT:
            return Object.assign({}, action.userData.answers);
        case actionTypes.INIT_END:
            return clean(state, action);
        default:
            break;
    }

    return state;
};
