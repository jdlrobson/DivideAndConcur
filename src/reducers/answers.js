import actionTypes from './../actionTypes';
import { getDifficultyRatings } from './../helpers/difficulty-ratings';

export function markWordAsEasy(difficultyRatings, char) {
    const newRating = difficultyRatings[char] ? difficultyRatings[char] - 1 : -1;
    difficultyRatings[char] = newRating;
    return Object.assign({}, difficultyRatings);
}

export function markWordAsDifficult(difficultyRatings, char) {
    const newRating = difficultyRatings[char] ? difficultyRatings[char] + 1 : 1;
    difficultyRatings[char] = newRating;
    return Object.assign({}, difficultyRatings);
}

export default (state={}, action) => {
    switch (action.type) {
        case actionTypes.GUESS_FLASHCARD_WRONG:
            return markWordAsDifficult(state, action.character);
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return markWordAsEasy(state, action.character);
        case actionTypes.INIT:
            return Object.assign({}, action.userData.answers);
        default:
            break;
    }

    return state;
};
