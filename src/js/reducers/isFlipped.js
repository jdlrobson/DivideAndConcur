import actionTypes from './../actionTypes';
import {
    PINYIN_TO_CHINESE, ENGLISH_TO_CHINESE, MATCH_PAIRS
} from './../constants';

export default (state = false, action) => {
    switch (action.type) {
        case actionTypes.START_ROUND:
            switch (action.game) {
                case PINYIN_TO_CHINESE:
                case ENGLISH_TO_CHINESE:
                case MATCH_PAIRS:
                    return false;
                default:
                    break;
            }
            break;
        case actionTypes.FLIP_CARDS_START:
            return false;
        case actionTypes.FLIP_CARDS_END:
            return true;
        default:
            break;
    }

    return state;
};
