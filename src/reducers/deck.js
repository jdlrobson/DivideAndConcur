import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.SET_DECK:
            return action.deck;
        case actionTypes.DISMOUNT_DECK:
            return false;
        default:
            return state;
    }
};
