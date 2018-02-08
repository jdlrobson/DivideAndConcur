import dictJson from './../../data/dictionary.json';
import DictionaryUtils from './../../data/DictionaryUtils';
import { getDifficultyRating, knowsWord,
    getDifficultyRatings } from './difficulty-ratings';

export const dictUtils = new DictionaryUtils(dictJson.words,
    dictJson.decompositions, dictJson.difficulty, dictJson.pinyin);

export const ALL_WORDS = dictUtils.all();

export function mapCard(state, character) {
    const difficultyLevel = getDifficultyRating(getDifficultyRatings(state), character);
    return {
        isKnown: knowsWord(getDifficultyRatings(state), character),
        character,
        difficultyLevel,
        level: `${dictUtils.getWordLength(character)}.${dictUtils.getDifficultyRating(character)}`,
        pinyin: dictUtils.getPinyin(character),
        english: dictUtils.getWord(character)
    };
}

export function getOrderedCards(answers) {
    return ALL_WORDS.map((character) => {
        const wordLength = dictUtils.getWordLength(character);
        const rating = dictUtils.getDifficultyRating(character);
        const difficultyLevel = getDifficultyRating(answers, character);

        return {
            wordLength,
            level: `${wordLength}.${rating}`,
            // My difficulty
            rating,
            // user difficulty
            difficultyLevel,
            character,
            // pinyin: dictUtils.getPinyin(character),
            english: dictUtils.getWord(character)
        };
    }).sort((card, card2) => {
        if (card.wordLength < card2.wordLength) {
            return -1;
        } else if (card.wordLength === card2.wordLength) {
            return card.rating < card2.rating ? -1 : 1;
        } else {
            return 1;
        }
    });
}

export function makeCardsFromCharacters(state, chars) {
    return chars.map(char => mapCard(state, char));
}

export function addHighlightedCards(state, char) {
    const highlighted = makeCardsFromCharacters(state, dictUtils.decompose(char));
    return Object.assign({}, state, {
        highlighted
    });
}

export function dealKnownCards(state) {
    const known = ALL_WORDS.filter(char => knowsWord(getDifficultyRatings(state), char));
    const cards = makeCardsFromCharacters(state, known);
    return Object.assign({}, state, { cards, previous: [] });
}

