import actionTypes from './../actionTypes';

export default (state = [], action) => {
    switch (action.type) {
        case actionTypes.INIT_END:
            return action.words;
        default:
            break;
    }

    return state;
};
