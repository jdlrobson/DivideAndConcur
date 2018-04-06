import actionTypes from './../actionTypes';
import { getDifficultyRatings } from './../helpers/difficulty-ratings';

export function markWordAsEasy(state, char) {
    const difficultyRatings = getDifficultyRatings(state);
    const newRating = difficultyRatings[char] !== undefined ? difficultyRatings[char] - 1 : 0;
    difficultyRatings[char] = Math.max( -5, newRating );
    return Object.assign({}, difficultyRatings);
}

export function markWordAsDifficult(state, char) {
    const difficultyRatings = getDifficultyRatings(state);
    const newRating = difficultyRatings[char] !== undefined ? difficultyRatings[char] + 1 : 1;
    difficultyRatings[char] = Math.min( 5, newRating );
    return Object.assign({}, difficultyRatings);
}

export function clean(state, action) {
    const words = action.words;
    Object.keys(state).forEach((char) => {
        if ( words.findIndex(word => word.character === char) === -1 ) {
            delete state[char];
        }
    });
    return Object.assign({}, state);
}

export default (state={}, action) => {
    switch (action.type) {
        case actionTypes.INIT:
            return Object.assign({}, action.userData.answers);
        case actionTypes.INIT_END:
            return clean(state, action);
        default:
            break;
    }

    return state;
};
