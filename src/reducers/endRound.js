import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.END_ROUND:
            return true;
        case actionTypes.START_ROUND:
            return false;
        default:
            break;
    }

    return state;
};
