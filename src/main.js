import 'preact/devtools';

import { applyMiddleware, compose, createStore } from 'redux';
import { checkForSave,
    checkForTimedAction, checkIfEndOfRound } from './subscribers';
import { h, render } from 'preact';

import App from './ui/App';
import { Provider } from 'preact-redux';
import { init, answerAllCardsInRound } from './actions';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer,
    composeEnhancers(
        applyMiddleware(thunkMiddleware)
    )
);

(function() {
    /**
   *******************************************
   * SUBSCRIBERS to all state changes
   *******************************************
   */
    const renderGame = () => {
        document.getElementById('container').innerHTML = '';
        const provider = (
            <Provider store={store}>
                <App />
            </Provider>
        );
        render(
            provider,
            document.getElementById('container')
        );
    };

    let keys = [];
    window.onkeypress = function(ev) {
        keys.push(ev.key);
        if (keys.join('').indexOf('JRG') > -1) {
            keys = [];
            store.dispatch(answerAllCardsInRound());
        }
        if (keys.length > 10) {
            keys = keys.slice(-10);
        }

    };

    // setup subscribers
    store.subscribe(checkIfEndOfRound(store));
    store.subscribe(checkForSave(store));

    /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
    const memory = localStorage.getItem('memory');
    const userData = memory ? JSON.parse(memory) : false;

    store.dispatch(init(userData));
    renderGame();
}());

