import actionTypes from './../actionTypes';
import { isMatchOneGame } from './../helpers/game';

export default (state = [], action) => {
    let cards;
    switch (action.type) {
        case actionTypes.RESET_ROUNDS:
            return [];
        case actionTypes.END_ROUND:
            cards = action.cards;
            if (isMatchOneGame(action.game)) {
                if (state.indexOf(cards[0].character) === -1) {
                    state.push(cards[0].character);
                }
            } else {
                cards.forEach((card) => {
                    if (state.indexOf(card.character) === -1) {
                        state.push(card.character);
                    }
                });
            }
            return state;
        case actionTypes.INIT_END:
            return [];
        default:
            return state;
    }
};
