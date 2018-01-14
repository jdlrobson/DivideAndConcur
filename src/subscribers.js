import actionTypes from './actionTypes'
import mcs from './mcs'

export function checkForTimedAction( store ) {
  return () => {
    const state = store.getState();
    const timedAction = state && state.timedAction;

    if ( timedAction ) {
      window.setTimeout(() => {
        store.dispatch( { type: timedAction } );
      }, 2000 );
      store.dispatch( actionTypes.CLEAR_TIMED_ACTION );
    }
  };
}

/**
 * Return a subscriber bound to the Redux store that
 * listens for a request to save and saves when needed.
 */
export function checkForSave( store ) {
  return () => {
    const state = store.getState();

    if ( state.isDirty ) {
      store.dispatch( actionTypes.SAVE_COMPLETE );
    }
  };
}

/**
 * Return a subscriber bound to the Redux store that
 * listens to game progress and decides whether to end the round or not.
 */
export function checkIfEndOfRound( store ) {
  return () => {
    const state = store.getState();
    const cards = state.cards || [];
    const answeredCards = cards.filter((card) => card.isAnswered);

    if ( cards && cards.length && answeredCards.length === cards.length ) {
      store.dispatch( actionTypes.END_ROUND );
    }
  };
}

export function checkIfPinyinNeeded( store ) {
  return () => {
    const state = store.getState();

    if ( state && state.charWithoutPinyin ) {
      const char = state.charWithoutPinyin;
      mcs.getPronounciation( char )
        .then(( pinyin ) => store.dispatch( { type: actionTypes.REQUEST_PINYIN_END.type, char, pinyin } ) );
    }
  };
}
