import actionTypes from './../actionTypes';

export default (state=0, action) => {
    switch (action.type) {
        case actionTypes.END_ROUND:
            return state + 1;
        default:
            break;
    }

    return state;
};
