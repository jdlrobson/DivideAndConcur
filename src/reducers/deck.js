import actionTypes from './../actionTypes';
import { DECK_START } from './../constants';

export default (state=DECK_START, action) => {
    switch (action.type) {
        case actionTypes.SET_DECK:
            return action.deck;
        case actionTypes.DISMOUNT_DECK:
            return false;
        default:
            return state;
    }
};
