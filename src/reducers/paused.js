import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.FLIP_CARDS_END:
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return false;
        case actionTypes.FLIP_CARDS_START:
            return true;
        default:
            break;
    }

    return state;
};
