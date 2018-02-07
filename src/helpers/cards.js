import dictJson from './../../data/dictionary.json';
import DictionaryUtils from './../../data/DictionaryUtils';

import { removeCharactersThatAreTooEasy } from './characters';
import { getDifficultyRating, knowsWord } from './difficulty-ratings';

const NUM_CARDS_PER_LEVEL = 10;
const MAX_DIFFICULTY = 20;

export const dictUtils = new DictionaryUtils(dictJson.words,
    dictJson.decompositions, dictJson.difficulty, dictJson.pinyin);

export const ALL_WORDS = dictUtils.all();

function findPackStartPosition(answers, pack) {
    let i = 0;
    while (knowsWord(answers, pack[i])) {
        i += 1;
    }
    return i;
}

function mapCard(state, character) {
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
            isKnown: knowsWord(answers, character),
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


function fastForwardToPackPosition(state) {
    let difficulty = state.difficulty;
    let wordSize = state.wordSize;
    const pack = dictUtils.getWords(wordSize, difficulty);
    const packPosition = findPackStartPosition(getDifficultyRatings(state), pack);
    const previous = state.previous || [];
    if (difficulty >= MAX_DIFFICULTY * (wordSize + 1)) {
        wordSize = 1;
        difficulty = 0;
    }

    if (pack.length === 0 && difficulty > MAX_DIFFICULTY) {
    // we ran out on this difficulty (there may be more but they are unreachable with current words)
    // given assumption every difficulty has at least one word
        return fastForwardToPackPosition(Object.assign({}, state, {
            wordSize: wordSize + 1,
            previous: pack.concat(previous),
            difficulty: 0
        }));
    } else if (packPosition >= pack.length) {
        return fastForwardToPackPosition(Object.assign({}, state, {
            wordSize,
            previous: pack.concat(previous),
            difficulty: difficulty + 1
        }));
    } else {
        return Object.assign({}, state, {
            pack,
            previous,
            packPosition,
            wordSize,
            difficulty
        });
    }
}

export function getDifficultyRatings(state) {
    return state.answers;
}

/**
 * Deal ten cards from the dictionary that the user is unfamiliar with
 * sorted by difficulty level
 */
export function dealCards(state, total = NUM_CARDS_PER_LEVEL) {
    const position = fastForwardToPackPosition(Object.assign({}, state,
        { difficulty: 0, wordSize: 0, previous: [] }));
    const pack = position.pack;
    const packPosition = position.packPosition;
    const cards = makeCardsFromCharacters(
        state,
        removeCharactersThatAreTooEasy(
            getDifficultyRatings(state),
            pack.slice(packPosition, packPosition + total)
        )
    );
    const answeredCardsInCurrentPack = pack.slice(0, packPosition);
    const previous = makeCardsFromCharacters(state,
        answeredCardsInCurrentPack.concat(position.previous));

    // if all have been answered lets deal again..
    return Object.assign({}, state, position, {
        cards, previous
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

