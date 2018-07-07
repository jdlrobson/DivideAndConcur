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

export function getKnownWords(difficultyRatings) {
    return Object.keys(difficultyRatings).filter(word => knowsWord(difficultyRatings, word));
}

export function getKnownWordCount(difficultyRatings) {
    return getKnownWords(difficultyRatings).length;
}

export function getUniqueChars(words) {
    const uniqueChars = [];
    words.forEach((word) => {
        Array.from(word).forEach((char) => {
            if (uniqueChars.indexOf(char) === -1) {
                uniqueChars.push(char);
            }
        });
    });
    return uniqueChars;
}

export function getUnKnownWordCount(difficultyRatings, char) {
    return Object.keys(difficultyRatings).filter(word =>
        difficultyRatings[word] !== undefined && !knowsWord(difficultyRatings, word)).length;
}

export function isTooEasy(difficultyRatings, char) {
    return difficultyRatings[char] && difficultyRatings[char] <= TOO_EASY;
}
