import { MATCH_DEFINITION, MATCH_SOUND,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE, MATCH_PAIRS
 } from './../constants';

export function isMatchOneGame(game) {
    switch (game) {
        case MATCH_DEFINITION:
        case MATCH_SOUND:
            return true;
        default:
            return false;
    }
}


export function isMatchPairsGame(game) {
    switch (game) {
    case MATCH_PAIRS:
        case MATCH_SOUND:
            return true;
        default:
            return false;
    }
}
