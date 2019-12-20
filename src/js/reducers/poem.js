
import { POEMS } from '../constants';
import actionTypes from '../actionTypes';

export default (state = false, action) => {
    const randomPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
    switch (action.type) {
        case actionTypes.INIT:
        case actionTypes.SWITCH_GAME:
            return randomPoem;
        default:
            return state;
    }
};
