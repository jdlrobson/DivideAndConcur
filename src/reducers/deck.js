import actionTypes from './../actionTypes';
import { DECK_START, DECK_NEW } from './../constants';
import { getKnownWordCount } from './../helpers/difficulty-ratings';

export default (state=DECK_START, action) => {
    switch (action.type) {
        case actionTypes.INIT_END:
            if (getKnownWordCount(action.answers) > 20) {
                return DECK_NEW;
            } else {
                return state;
            }
        case actionTypes.SET_DECK:
            return action.deck;
        case actionTypes.DISMOUNT_DECK:
            return false;
        default:
            return state;
    }
};
