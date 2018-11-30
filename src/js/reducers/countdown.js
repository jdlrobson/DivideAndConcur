import actionTypes from './../actionTypes';

export default (state = 0, action) => {
    switch (action.type) {
        case actionTypes.FLIP_CARDS_START:
            return action.countdown > 1 ? action.countdown : 0;
        case actionTypes.COUNT_DOWN:
            return state > 0 ? state - 1 : 0;
        default:
            break;
    }

    return state;
};
