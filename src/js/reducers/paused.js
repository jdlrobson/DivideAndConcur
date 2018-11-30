import actionTypes from './../actionTypes';

export default (state = false, action) => {
    switch (action.type) {
        case actionTypes.HIDE_OVERLAY:
        case actionTypes.START_ROUND:
        case actionTypes.FLIP_CARDS_END:
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
        case actionTypes.DISMOUNT_DECK:
        case actionTypes.DISMOUNT_GAME:
        case actionTypes.END_ROUND:
            return false;
        case actionTypes.SHOW_OVERLAY:
        case actionTypes.FLIP_CARDS_START:
            return true;
        default:
            break;
    }

    return state;
};
