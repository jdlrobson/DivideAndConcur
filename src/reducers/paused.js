import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.START_ROUND:
        case actionTypes.FLIP_CARDS_END:
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return false;
        case actionTypes.END_ROUND:
        case actionTypes.FLIP_CARDS_START:
            return true;
        default:
            break;
    }

    return state;
};