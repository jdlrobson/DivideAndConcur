import actionTypes from './actionTypes'

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
