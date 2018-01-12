import actionTypes from './actionTypes'
import mcs from './mcs'

/**
 * Return a subscriber bound to the Redux store that
 * listens to game progress and decides whether to end the round or not.
 */
export function checkIfEndOfRound( store ) {
  return () => {
    const state = store.getState();
    const cards = state.cards;

    if ( cards && cards.length && state.answered === cards.length ) {
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
