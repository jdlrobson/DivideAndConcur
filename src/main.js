import 'preact/devtools';

import { applyMiddleware, compose, createStore } from 'redux';
import { checkForSave,
    checkForTimedAction, checkIfEndOfRound } from './subscribers';
import { h, render } from 'preact';

import GameChooser from './ui/GameChooser';
import { Provider } from 'preact-redux';
import actionTypes from './actionTypes';
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

function action(actionType, data) {
    return Object.assign({}, {
        type: typeof actionType === 'string' ? actionType : actionType.type
    }, data);
}

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
                <GameChooser actionTypes={actionTypes} />
            </Provider>
        );
        render(
            provider,
            document.getElementById('container')
        );
    };

    // setup subscribers
    store.subscribe(checkIfEndOfRound(store));
    store.subscribe(checkForTimedAction(store));
    store.subscribe(checkForSave(store));

    /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
    const memory = localStorage.getItem('memory');
    const userData = memory ? JSON.parse(memory) : false;

    store.dispatch(action(actionTypes.BOOT, { userData }));
    renderGame();
}());

