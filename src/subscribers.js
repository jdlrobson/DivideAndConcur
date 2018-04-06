import { endRound, saveComplete, dismountDeck, renderComplete } from './actions';
import { DECK_NEW } from './constants';
import App from './ui/App';
import { h, render } from 'preact';
import { Provider } from 'preact-redux';
// Tell Babel to transform JSX into h() calls:
/** @jsx h */

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

export function checkForBoot(store) {
    return () => {
        const state = store.getState();
        if ( state.isBooted && !state.isRendered ) {
            store.dispatch(renderComplete());
            const provider = (
                <Provider store={store}>
                    <App />
                </Provider>
            );
            document.getElementById('container').innerHTML = '';
            render(
                provider,
                document.getElementById('container')
            );
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
