import actionTypes from './../actionTypes';
import { getHighlightedCards } from './../helpers/cards';

function pushCardToStackIfExists(stack, character) {
    const card = getHighlightedCards({}, character)[0];
    return card && card.pinyin ?
        [
            Object.assign({
                onExpandCard: false,
            }, card)
        ].concat(stack) : stack;
}

export default (state = [], action) => {
    switch (action.type) {
        case actionTypes.HIDE_OVERLAY:
            // Remove the top overlay from the stack
            return state.slice(1);
        case actionTypes.SHOW_OVERLAY:
            // Push the new card to the top of the stack (item 0)
            return action.character ?
                pushCardToStackIfExists(state, action.character) :
                [ action ].concat(state);
        default:
            break;
    }

    return state;
};
