import { MATCH_DEFINITION, MATCH_SOUND } from './../constants';

export function isMatchOneGame(game) {
    switch (game) {
        case MATCH_DEFINITION:
        case MATCH_SOUND:
            return true;
        default:
            return false;
    }
}
