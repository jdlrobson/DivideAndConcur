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
