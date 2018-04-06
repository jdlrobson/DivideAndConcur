import actionTypes from './../actionTypes';

export default (state=false, action) => {
    switch (action.type) {
        case actionTypes.RENDER_COMPLETE:
            return true;
        default:
            break;
    }

    return state;
};
