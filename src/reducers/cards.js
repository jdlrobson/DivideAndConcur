import { mapCard } from './../helpers/cards';
import { isTooEasy, knowsWord } from './../helpers/difficulty-ratings';
import { MAX_DIFFICULTY } from './../constants';

export function getUnknownCards(state, total) {
    const words = state.words.filter(word => !isTooEasy(state.answers, word.character) &&
        word.rating < MAX_DIFFICULTY * word.wordLength
    );
    const firstUnknown = words.findIndex(word => !knowsWord(state.answers, word.character));
    const cards = words.slice(firstUnknown, firstUnknown + total)
        .map(word => mapCard(state, word.character));

    return cards;
}
