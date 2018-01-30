import actionTypes from './actionTypes';
import mcs from './mcs';

function requestPinyinStart(character) {
    return { type: actionTypes.REQUEST_PINYIN_START, character };
}

export function requestPinyin(character) {
    return (dispatch, getState) => {
        if (getState().characterRequested !== character) {
            dispatch(requestPinyinStart(character));
            return mcs.getPronounciation(character)
        .then((pinyin) => {
            if (getState().characterRequested === character) {
                dispatch({ type: actionTypes.REQUEST_PINYIN_END.type,
                    character,
                    pinyin });
            }
        });
        }
    };
}
