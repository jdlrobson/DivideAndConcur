import { mapCard, shuffle, freezeCards as freezeCardsHelper } from './../helpers/cards';
import { isTooEasy, knowsWord, getDifficultyRatings } from './../helpers/difficulty-ratings';
import { MAX_DIFFICULTY } from './../constants';

function updateCardInCards(cards, character, index, props) {
    return cards.map((card, i) => {
        return character === card.character &&
            (index === i || index === false) ?
            Object.assign({}, card,  props) : card;
    });
}

export function selectAndAnswerAll(state, isKnown) {
    return state.cards.map(card => Object.assign({}, card, { isAnswered: true,
        isSelected: true,
        isKnown }));
}

export function markCardsAsAnswered(state, character, isKnown) {
    return updateCardInCards(state.cards, character, false, { isAnswered: true, isKnown });
}

export function answerCard(state, character, index, isKnown) {
    return updateCardInCards(state.cards, character, index, { isAnswered: true, isKnown });
}

export function deselectUnansweredCards(state) {
    const cards = state.cards;
    return cards.map((card, i) => {
        return card.isSelected && !card.isAnswered ?
            Object.assign({}, card,  { isSelected: false }) : card;
    });
}

export function selectCard(state, character, index) {
    return updateCardInCards(state.cards, character, index, { isSelected: true, isFlipped: false });
}
export function addIndexToCards(state) {
    return state.cards.map((card, i) => Object.assign({}, card, { index: i }));
}

export function freezeCards(state) {
    return freezeCardsHelper(state.cards);
}

export function getUnknownCards(state, total) {
    const words = state.words.filter(word => !isTooEasy(state.answers, word.character) &&
        word.rating < MAX_DIFFICULTY * Math.max(1, word.wordLength)
    );
    const firstUnknown = words.findIndex(word => !knowsWord(state.answers, word.character));
    const cards = words.slice(firstUnknown, firstUnknown + total)
        .map(word => mapCard(state, word.character));

    return cards;
}

export function cloneCards(state) {
    return state.cards.concat(state.cards);
}

export function getKnownCards(state) {
    return state.words.filter(word => knowsWord(getDifficultyRatings(state), word.character))
        .map(word => mapCard(state, word.character));
}

export function cutCardDeck(state, total) {
    return state.cards.slice(0,total);
}

export function shuffleCards(state) {
    return shuffle(state.cards);
}

export function flipCards(state) {
    return state.cards.map(card => {
        if ( card.isAnswered ) {
            return card;
        } else {
            return Object.assign({}, card, { isFlipped: true, isSelected: false });
        }
    });
}
