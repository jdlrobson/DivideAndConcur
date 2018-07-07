import actionTypes from './../actionTypes';

export default (state = false, action) => {
    switch (action.type) {
        case actionTypes.SAVE_COMPLETE:
            return false;
        case actionTypes.END_ROUND:
            return true;
        default:
            break;
    }

    return state;
};
