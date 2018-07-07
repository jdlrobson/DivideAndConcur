import actionTypes from './../actionTypes';
import { getHighlightedCards } from './../helpers/cards';

export default (state = false, action) => {
    switch (action.type) {
        case actionTypes.HIDE_OVERLAY:
            return false;
        case actionTypes.SHOW_OVERLAY:
            return Object.assign({
                onExpandCard: false,
            }, getHighlightedCards({}, action.character)[0]);
        default:
            break;
    }

    return state;
};
