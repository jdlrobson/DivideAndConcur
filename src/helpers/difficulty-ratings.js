export function getDifficultyRating(difficultyRatings, char) {
    return difficultyRatings[char] || 0;
}

export function knowsWord(difficultyRatings, char) {
    return difficultyRatings[char] && difficultyRatings[char] < 0;
}

export function getKnownWordCount(difficultyRatings, char) {
    return Object.keys(difficultyRatings).filter(word => knowsWord(difficultyRatings, word)).length;
}
