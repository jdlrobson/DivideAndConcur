import { endRound, saveComplete, timedAction } from './actions';

export function checkForTimedAction(store) {
    return () => {
        const state = store.getState();
        const queuedTimedAction = state && state.timedAction;

        if (queuedTimedAction) {
            store.dispatch(
                timedAction(queuedTimedAction, state.timedActionDuration || 5000)
            );
        }
    };
}

/**
 * Return a subscriber bound to the Redux store that
 * listens for a request to save and saves when needed.
 */
export function checkForSave(store) {
    return () => {
        const state = store.getState();

        if (state.isDirty) {
            localStorage.setItem('memory', JSON.stringify({
                answers: state.answers
            }));
            store.dispatch(saveComplete());
        }
    };
}

/**
 * Return a subscriber bound to the Redux store that
 * listens to game progress and decides whether to end the round or not.
 */
export function checkIfEndOfRound(store) {
    return () => {
        const state = store.getState();
        const cards = state.cards || [];
        const answeredCards = cards.filter(card => card.isAnswered);

        if (cards && cards.length && answeredCards.length === cards.length) {
            store.dispatch(endRound());
        }
    };
}
