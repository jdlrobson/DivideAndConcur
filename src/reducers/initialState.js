import actionTypes from './../actionTypes';
import { getKnownWordCount } from './../helpers/difficulty-ratings';

export default (state={}, action) => {
    switch (action.type) {
        case actionTypes.INIT_END:
            return { known: getKnownWordCount(action.answers) };
        default:
            break;
    }

    return state;
};
