import actionTypes from './../actionTypes';
import { MATCH_SOUND, MATCH_PAIRS,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    MATCH_DEFINITION,
    DECK_START, DEBUG_WORDS,
    DECK_UNKNOWN, DECK_NEW, DECK_KNOWN
} from './../constants';
import { mapCard, shuffle, isCardInGame,
    freezeCards as freezeCardsHelper } from './../helpers/cards';
import { knowsWord, getDifficultyRatings } from './../helpers/difficulty-ratings';
import { isMatchOneGame } from './../helpers/game';

function updateCardInCards(cards, character, index, props) {
    return cards.map((card, i) => {
        return character === card.character &&
            (index === i || index === false) ?
            Object.assign({}, card,  props) : card;
    });
}

export function selectAndAnswerAll(state, isKnown) {
    return state.map(card => Object.assign({}, card, { isAnswered: true,
        isSelected: true,
        isKnown }));
}

export function markCardsAsAnswered(state, character, isKnown) {
    return updateCardInCards(state.cards, character, false, { isAnswered: true, isKnown });
}

export function answerCard(state, character, index, isKnown) {
    return updateCardInCards(state, character, index, { isAnswered: true, isKnown });
}

export function deselectUnansweredCards(state) {
    return state.map((card, i) => {
        return card.isSelected && !card.isAnswered ?
            Object.assign({}, card,  { isSelected: false }) : card;
    });
}

export function selectCard(cards, character, index) {
    return updateCardInCards(cards, character, index, { isSelected: true, isFlipped: false });
}
export function addIndexToCards(state) {
    return state.cards.map((card, i) => Object.assign({}, card, { index: i }));
}

export function getUnknownCards(state, total) {
    const ratings = getDifficultyRatings(state);
    const cards = state.words.filter((word) => {
        return ratings[word.character] === undefined &&
            isCardInGame(word);
    });

    return cards.slice(0, total)
        .map(word => mapCard(state, word.character));
}

export function cloneCards(state) {
    return state.cards.concat(state.cards);
}

export function getKnownCards(state, total) {
    const ratings = getDifficultyRatings(state);
    return shuffle(
        state.words.filter(word => knowsWord(ratings, word.character))
            .filter(isCardInGame)
            .map(word => mapCard(state, word.character))
    );
}

export function getDifficultWordSorter(ratings) {
    return (word1, word2) => {
        if (word1.wordLength === word2.wordLength) {
            // if cards are same word length, prioritise the easier cards
            return ratings[word1.character] < ratings[word2.character] ? -1 : 1;
        } else {
            return word1.wordLength < word2.wordLength ? -1 : 1;
        }
    };
}

/**
 * If the number of hard cards is less than the total, then cards
 * will be added from unknown cards and then available cards.
 */
export function getHardCards(state, total) {
    const ratings = getDifficultyRatings(state);
    let available = state.words.filter((word) => {
        const char = word.character;
        return ratings[char] !== undefined && ratings[char] >= 0;
    });

    if (available.length < total) {
        available = available.concat(
            getUnknownCards(state, total - available.length)
        );
    }
    if (available.length < total) {
        available = available.concat(
            getKnownCards(state, total - available.length)
        );
    }

    return shuffle(
        // Shuffle `total` * 2 cards to add some variety when lots of unknown words
        // if total is undefined no slicing will happen
        available.sort(getDifficultWordSorter(ratings)).slice(0, total ? total * 2 : total)
        // and then limit to `total` cards
    ).slice(0, total)
        .map(word => mapCard(state, word.character));
}

function chooseDeck(_cards, action) {
    let cards = [];
    const state = { words: action.words, answers: action.answers };
    if (DEBUG_WORDS && DEBUG_WORDS.length) {
        state.words = state.words.filter(word => DEBUG_WORDS.indexOf(word.character) > -1);
    }
    switch (action.deck) {
        case DECK_START:
            cards = [ '切', '刀', '七' ].map(char => mapCard(state, char));
            break;
        case DECK_UNKNOWN:
            cards = getHardCards(state, 9);
            break;
        case DECK_NEW:
            cards = getUnknownCards(state, 9);
            break;
        case DECK_KNOWN:
            cards = getKnownCards(state, 9);
            break;
        default:
            break;
    }
    return cards;
}

export function intersection(a, b) {
    return Array.from(
        new Set(a.filter(s => b.indexOf(s) > -1))
    );
}

function noDupePinyin(cards) {
    const newCards = [];
    cards.forEach((thisCard, i) => {
        // if the card hasn't been used so far, add it.
        if (newCards.findIndex(card => card.pinyin === thisCard.pinyin) === -1) {
            newCards.push(thisCard);
        }
    });
    return newCards.slice(0, 4);
}

function noDupeTranslations(cards) {
    let translationsSoFar = [];
    const newCards = [];
    cards.forEach((thisCard, i) => {
        // if the card hasn't been used so far, add it.
        if (intersection(translationsSoFar, thisCard.translations).length === 0) {
            // merge it into the current set of translations
            translationsSoFar = translationsSoFar.concat(thisCard.translations);
            newCards.push(thisCard);
        }
    });
    return newCards.slice(0, 4);
}

export function pickCardsFromDeck(cards, action) {
    const card = cards[0];
    switch (action.game) {
        case MATCH_DEFINITION:
            // 4 cards will be used in the game.
            cards = noDupeTranslations(cards);
            // shuffle them again
            cards = shuffleCards({ cards });
            // add the goal card at the front
            cards.unshift(card);
            break;
        case MATCH_SOUND:
            // 4 cards will be used in the game.
            cards = noDupePinyin(cards);
            // shuffle them again
            cards = shuffleCards({ cards });
            // add the goal card at the front
            cards.unshift(card);
            break;
        case PINYIN_TO_CHINESE:
        case ENGLISH_TO_CHINESE:
        case MATCH_PAIRS:
            cards = cutCardDeck({ cards }, 6);
            cards = cloneCards({ cards });
            cards = shuffleCards({ cards });
            break;
        default:
            cards = shuffleCards({ cards });
            break;
    }
    return cards;
}

export function pickCardsForGame(_cards, action) {
    return pickCardsFromDeck(chooseDeck(_cards, action), action);
}

export function cutCardDeck(state, total) {
    return state.cards.slice(0,total);
}

export function shuffleCards(state) {
    return addIndexToCards({ cards: shuffle(state.cards) });
}

export function resetCards(cards) {
    return cards.map((card) => {
        return Object.assign({}, card, { isFlipped: false, isAnswered: false, isSelected: true });
    });
}

export function flipCards(state) {
    return state.map((card) => {
        if (card.isAnswered) {
            return card;
        } else {
            return Object.assign({}, card, { isFlipped: true, isSelected: false });
        }
    });
}

// Reducer for when a card is answered
function actionAnswerCard(state, action) {
    const char = action.character;
    const isKnown = true;

    return answerCard(state, char, action.index, isKnown);
}

function newRound(cards, action) {
    const game = action.game;
    const answers = action.answers;
    const words = action.words;
    const deck = action.deck;
    return addIndexToCards(
        {
            cards: pickCardsForGame(cards, { game, answers, words, deck })
        }
    );
}

function revealCardInAction(cards, action) {
    return selectCard(cards, action.character, action.index);
}

export function revealedFlashcard(state, action) {
    if (action.paused) {
        return state;
    } else if (isMatchOneGame(action.game)) {
        // Regardless of whether right or wrong, the first card was answered
        state[0].isAnswered = true;
        return revealCardInAction(
            markCardsAsAnswered({ cards: state }, action.character, action.isKnown),
            action
        );
    }  else {
        return revealCardInAction(state, action);
    }
}

function resetCurrentDeck(cards, action) {
    switch (action.game) {
        case PINYIN_TO_CHINESE:
        case ENGLISH_TO_CHINESE:
        case MATCH_PAIRS:
            return shuffleCards({ cards: resetCards(cards) });
        default:
            break;
    }
    return cards;
}

export default (state = [], action) => {
    let cards;
    const words = action.words;
    const answers = action.answers;

    switch (action.type) {
        case actionTypes.RESET_CURRENT_DECK:
            return resetCurrentDeck(state, action);
        case actionTypes.REVEAL_FLASHCARD:
            return revealedFlashcard(state, action);
        case actionTypes.START_ROUND:
            return newRound(state, action);
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return actionAnswerCard(state, action);
        case actionTypes.CHEAT_ANSWER_ALL:
            state.forEach((card) => {
                cards = actionAnswerCard(state, {
                    type: action.isCorrect ?
                        actionTypes.GUESS_FLASHCARD_RIGHT :
                        actionTypes.GUESS_FLASHCARD_WRONG,
                    character: card.character
                });
            });
            return selectAndAnswerAll(cards, false);
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return deselectUnansweredCards(state);
        case actionTypes.FLIP_CARDS_END:
            return flipCards(state);
        case actionTypes.END_ROUND:
            return freezeCardsHelper(state);
        case actionTypes.INIT_END:
            // Load known cards into cache
            getKnownCards(Object.assign({}, state, { words, answers }));
            break;
        default:
            break;
    }

    return state;
};
