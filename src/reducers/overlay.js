import actionTypes from './../actionTypes';
import { getHighlightedCards } from './../helpers/cards';

function getCardIfExists(character) {
    const card = getHighlightedCards({}, character)[0];
    return card && card.pinyin ?
        Object.assign({
            onExpandCard: false,
        }, card) : {};
}
export default (state = false, action) => {
    switch (action.type) {
        case actionTypes.HIDE_OVERLAY:
            return false;
        case actionTypes.SHOW_OVERLAY:
            return getCardIfExists(action.character);
        default:
            break;
    }

    return state;
};
