import { TOO_EASY } from './../constants';

export function getDifficultyRatings(state) {
    return state.answers;
}

export function getDifficultyRating(difficultyRatings, char) {
    return difficultyRatings[char] || 0;
}

export function knowsWord(difficultyRatings, char) {
    return difficultyRatings[char] && difficultyRatings[char] < 0;
}

export function getKnownWordCount(difficultyRatings, char) {
    return Object.keys(difficultyRatings).filter(word => knowsWord(difficultyRatings, word)).length;
}

export function getUnKnownWordCount(difficultyRatings, char) {
    return Object.keys(difficultyRatings).filter(word =>
        difficultyRatings[word] !== undefined && !knowsWord(difficultyRatings, word)).length;
}

export function isTooEasy(difficultyRatings, char) {
    return difficultyRatings[char] && difficultyRatings[char] <= TOO_EASY;
}
