import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.SWITCH_GAME:
            return action.game;
        case actionTypes.DISMOUNT_DECK:
        case actionTypes.DISMOUNT_GAME:
            return false;
        default:
            break;
    }

    return state;
};
