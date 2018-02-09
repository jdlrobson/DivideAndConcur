import { makeCardsFromCharacters, dictUtils, freezeCards } from './../helpers/cards';

export function getHighlightedCards(state, char) {
    return freezeCards(makeCardsFromCharacters(state,
        dictUtils.decompose(char).filter(char => char && char !== '?').slice(0,2)
    ));
}
