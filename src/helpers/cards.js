import dictJson from './../../data/dictionary.json';
import blurbs from './../../data/blurbs.json';
import DictionaryUtils from './../../data/DictionaryUtils';
import { getDifficultyRating, knowsWord,
    getDifficultyRatings } from './difficulty-ratings';
import { MAX_DIFFICULTY } from './../constants';
import { random } from './../utils'

export const DATA_MODIFIED_LAST = dictJson.modified;
export const dictUtils = new DictionaryUtils(dictJson.words,
    dictJson.decompositions, dictJson.difficulty, dictJson.pinyin);

export const ALL_WORDS = dictUtils.all();

export function translationArray( definition ) {
    let translations = [];
    if ( definition ) {
        translations = definition.trim().replace(/;$/, '').split(';');
        if ( translations.length > 1 ) {
            translations = translations.map((translation, i) =>
                `[${i+1}/${translations.length}] ${translation.trim()}`);
        }
    }
    return translations;
}

export function mapCard(state, character, withDecompositions, withBlurb) {
    let decompositions = withDecompositions ?
      makeCardsFromCharacters(
        state,
        dictUtils.decompose( character ).filter((char) => char !== character ),
        withDecompositions, withBlurb
      ) : [];

    const text = withBlurb ? blurbs[character] : undefined;
    const translations = translationArray(dictUtils.getWord(character));

    return {
        character,
        text,
        level: `${dictUtils.getWordLength(character)}.${dictUtils.getDifficultyRating(character)}`,
        pinyin: dictUtils.getPinyin(character),
        translations,
        english: random(translations),
        decompositions
    };
}

export function getAnsweredCards(state) {
    return state.cards.filter(card => card.isAnswered);
}

export function getSelectedUnansweredCards(state) {
    return state.cards.filter(card => card.isSelected && !card.isAnswered);
}

export function isCardInGame( card ) {
  return card.rating < MAX_DIFFICULTY * Math.max(1, card.wordLength);
}

export function getAllCardsWithUserDifficulty(answers) {
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
    }).filter( isCardInGame ).sort((card, card2) => {
        if (card.wordLength < card2.wordLength) {
            return -1;
        } else if (card.wordLength === card2.wordLength) {
            return card.rating < card2.rating ? -1 : 1;
        } else {
            return 1;
        }
    });
}

export function freezeCards(cards) {
    return cards.map(card => Object.assign({}, card, { isFrozen: true }));
}

export function makeCardsFromCharacters(state, chars, withDecompositions, withBlurbs) {
    return chars.map(char => mapCard(state, char, withDecompositions, withBlurbs));
}

export function dealKnownCards(state) {
    const known = ALL_WORDS.filter(char => knowsWord(getDifficultyRatings(state), char));
    const cards = makeCardsFromCharacters(state, known);
    return Object.assign({}, state, { cards });
}

export function shuffle(arr) {
    return arr.sort((a,b) => { return Math.random() < 0.5 ? -1 : 1; });
}
