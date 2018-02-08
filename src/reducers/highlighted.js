import { makeCardsFromCharacters, dictUtils } from './../helpers/cards'

export function getHighlightedCards(state, char) {
    return makeCardsFromCharacters(state,
        dictUtils.decompose(char).filter((char)=>char && char !== '?')
    );
}
