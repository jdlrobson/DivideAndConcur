/* global SpeechSynthesisUtterance */
import { endRound, saveComplete, renderComplete } from './actions';
import actionTypes from './actionTypes';
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

function say(word) {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const voice = voices.filter(voice => voice.lang.indexOf('zh') === 0)[0];
    const utterThis = new SpeechSynthesisUtterance(word);
    utterThis.voice = voice;
    utterThis.rate = 0.75;
    synth.speak(utterThis);
}

export function speakHighlightedWord(store) {
    return () => {
        if (window.speechSynthesis && typeof SpeechSynthesisUtterance !== undefined) {
            const state = store.getState();
            if (state.highlighted) {
                const curCard = state.highlighted[0];
                if (curCard && state.lastActionType === actionTypes.REVEAL_FLASHCARD) {
                    say(curCard.character);
                }
            }
        }
    };
}

export function checkForBoot(store, callback) {
    return () => {
        const state = store.getState();
        if (state.isBooted && !state.isRendered) {
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
            callback();
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
