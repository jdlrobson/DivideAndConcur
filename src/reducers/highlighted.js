import actionTypes from './../actionTypes';
import { getHighlightedCards } from './../helpers/cards';

export default (state=[], action) => {
    switch (action.type) {
        case actionTypes.HIGHLIGHT_CHARACTER:
            return getHighlightedCards(state, action.character);
        case actionTypes.REVEAL_FLASHCARD:
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return getHighlightedCards(state, action.character);
        default:
            break;
    }

    return state;
};
