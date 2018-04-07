import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.INIT:
            return false;
        case actionTypes.INIT_END:
            return true;
        default:
            break;
    }

    return state;
};
