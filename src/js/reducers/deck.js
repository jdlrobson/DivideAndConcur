import actionTypes from './../actionTypes';
import { DECK_START, DECK_NEW, DECK_UNKNOWN, MAXIMUM_UNKNOWN_WORDS } from './../constants';
import { getDifficultWords, getKnownWordCount } from './../helpers/difficulty-ratings';

export default (state = DECK_START, action) => {
    switch (action.type) {
        case actionTypes.INIT_END:
            if (getKnownWordCount(action.answers) > 20) {
                return getDifficultWords(action.answers).length < MAXIMUM_UNKNOWN_WORDS ?
                    // Only serve new words if there are less than 20 unknown ones
                    // Otherwise jump straight into unknown words
                    DECK_NEW : DECK_UNKNOWN;
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
