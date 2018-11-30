import actionTypes from './../actionTypes';

export default (state = 0, action) => {
    switch (action.type) {
        case actionTypes.RESET_ROUNDS:
            return 0;
        case actionTypes.END_ROUND:
            return state + 1;
        default:
            break;
    }

    return state;
};
