import actionTypes from './../actionTypes';
import { makeCardsFromCharacters, dictUtils, freezeCards } from './../helpers/cards';

function getHighlightedCards(state, char) {
    return freezeCards(
        makeCardsFromCharacters(state,
            [ char ],
            true,
            true
        )
    );
}

export default (state=[], action) => {
    switch (action.type) {
        case actionTypes.REVEAL_FLASHCARD:
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return getHighlightedCards(state, action.character);
        default:
            break;
    }

    return state;
};
