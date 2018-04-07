/** @jsx h */
import { MATCH_SOUND, MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    DECK_NEW, DECK_KNOWN, DECK_UNKNOWN,
} from './constants';
import { getDifficultyRatings } from './helpers/difficulty-ratings';
import { shuffle, getSelectedUnansweredCards, getAnsweredCards,
    dictUtils,
    makeCardsFromCharacters  } from './helpers/cards';
import { getUnknownCards, getKnownCards, getHardCards,
    flipCards, cloneCards, answerCard,
    selectAndAnswerAll,
    pickCardsForGame,
    selectCard, deselectUnansweredCards, markCardsAsAnswered,
    cutCardDeck, shuffleCards, addIndexToCards } from './reducers/cards';
import _answers, { markWordAsDifficult, markWordAsEasy } from './reducers/difficulty-ratings';
import _deck from './reducers/deck';
import _highlighted from './reducers/highlighted';
import _isRendered from './reducers/isRendered';
import _paused from './reducers/paused';
import _cards from './reducers/cards';
import _game from './reducers/game';
import _isFlipping from './reducers/isFlipping';
import _isFlipped from './reducers/isFlipped';
import _isDirty from './reducers/isDirty';
import _isBooted from './reducers/isBooted';
import _words from './reducers/words';
import _endRound from './reducers/endRound';
import actionTypes from './actionTypes';

function revealCardInAction(state, action) {
    const cards = selectCard(state.cards, action.character, action.index);
    return Object.assign({}, state, {
        cards
    });
}

function revealFlashcardDecompose(state, action) {
    const card = state.cards[0];
    const isEnd = getAnsweredCards(state).length === 1;
    const char = action.character;
    const isKnown = card.character === char;
    let answers = getDifficultyRatings(state);
    let cards = state.cards;

    if (!isEnd) {
        if (isKnown) {
            answers = markWordAsEasy(state, char);
        } else {
            answers = markWordAsDifficult(state, char);
        }
    }
    // Mark selected card as answered
    cards = markCardsAsAnswered(state, action.character, isKnown);

    return Object.assign({}, state, { answers, cards });
}
function revealedFlashcard(state, action) {
    if (action.game === MATCH_SOUND) {
        return revealCardInAction(revealFlashcardDecompose(state, action), action);
    }  else {
        return revealCardInAction(state, action);
    }
}



const reducer = (state={}, action) => {
    const highlighted = _highlighted(state.highlighted, action);
    const paused = _paused(state.paused, action);
    const isRendered = _isRendered(state.isRendered, action);
    const deck = _deck(state.deck, action);
    const isBooted = _isBooted(state.isBooted, action);
    const words = _words(state.words, action);
    const answers = _answers(state.answers, action);
    const cards = _cards(state.cards, action);
    const isDirty = _isDirty(state.isDirty, action);
    const game = _game(state.game, action);
    const endRound = _endRound(state.endRound, action);
    const isFlipped = _isFlipped(state.isFlipped, action);
    const isFlipping = _isFlipping(state.isFlipping, action);
    state = Object.assign({}, state, {
        paused, highlighted, deck, answers, cards,
        isRendered, isDirty, isBooted, words, game,
        endRound, isFlipping, isFlipped
    });
    // All these actions are user driven and will not work if paused.
    if (!paused) {
        switch (action.type) {
            case actionTypes.REVEAL_FLASHCARD:
                return revealedFlashcard(state, Object.assign( action, { game } ));
            default:
                break;
        }
    }
    return state;
};

const reducerWithPerf = function(state, action) {
    const before = new Date();
    const newState = reducer(state, action);
    const after = new Date();
    const perf = after - before;
    return Object.assign( {}, newState, { perf } );
};

export default reducerWithPerf;
