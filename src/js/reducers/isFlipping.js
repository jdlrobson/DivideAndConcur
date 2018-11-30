import actionTypes from './../actionTypes';

export default (state = false, action) => {
    switch (action.type) {
        case actionTypes.FLIP_CARDS_START:
            return true;
        case actionTypes.FLIP_CARDS_END:
            return false;
        default:
            break;
    }

    return state;
};
