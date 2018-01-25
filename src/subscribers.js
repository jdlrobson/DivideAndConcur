import actionTypes from './actionTypes'

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
      if ( state.dataToSave ) {
        localStorage.setItem('memory', JSON.stringify( state.dataToSave ));
        store.dispatch( actionTypes.SAVE_COMPLETE );
      } else {
        throw 'An unexpected error occurred.'
      }
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
