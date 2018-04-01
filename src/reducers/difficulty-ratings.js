import actionTypes from './../actionTypes';
import { getDifficultyRatings } from './../helpers/difficulty-ratings';

export function markWordAsEasy(state, char) {
    const difficultyRatings = getDifficultyRatings(state);
    const newRating = difficultyRatings[char] ? difficultyRatings[char] - 1 : -1;
    difficultyRatings[char] = newRating;
    return Object.assign({}, difficultyRatings);
}

export function markWordAsDifficult(state, char) {
    const difficultyRatings = getDifficultyRatings(state);
    const newRating = difficultyRatings[char] ? difficultyRatings[char] + 1 : 1;
    difficultyRatings[char] = newRating;
    return Object.assign({}, difficultyRatings);
}

export default (state={}, action) => {
    switch (action.type) {
        case actionTypes.INIT:
            return Object.assign({}, action.userData.answers);
        default:
            break;
    }

    return state;
};
