import 'preact/devtools';

import { applyMiddleware, compose, createStore } from 'redux';
import { checkForSave, checkForBoot,
    speakHighlightedWord,
    checkIfEndOfRound } from './subscribers';
import {
    TAKE_A_BREAK
} from './constants';
import { init, answerAllCardsInRound, highlightCharacter, switchGame,
    showCharacterOverlay,
    startRound } from './actions';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';
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
    let keys = [];

    function checkCheatCode(ev) {
        if (ev.type === 'paste') {
            keys = keys.concat(ev.clipboardData.getData('text/plain'));
        } else {
            keys.push(ev.key);
        }
        const code = keys.join('');
        const cards = store.getState().cards;
        if (code.indexOf('LL') > -1) {
            store.dispatch(switchGame(TAKE_A_BREAK));
            store.dispatch(startRound());
        } else if (code.indexOf('JRG') > -1) {
            keys = [];
            store.dispatch(answerAllCardsInRound(false, cards));
        } else if (code.indexOf('JRH') > -1) {
            keys = [];
            store.dispatch(answerAllCardsInRound(true, cards));
        } else if (code.indexOf('LC') > -1) {
            const char = code.slice(code.indexOf('LC') + 2);
            if (char) {
                store.dispatch(highlightCharacter(char));
                if (char.length === 2) {
                    keys = [];
                }
            }
        }
        if (keys.length > 10) {
            keys = keys.slice(-10);
        }

    }
    document.body.onpaste = checkCheatCode;
    window.onkeypress = checkCheatCode;

    // setup subscribers
    store.subscribe(checkIfEndOfRound(store));
    store.subscribe(checkForSave(store));
    store.subscribe(checkForBoot(store, () => {
        hide($('#chrome__content__panel-one')[0]);
    }));
    store.subscribe(speakHighlightedWord(store));

    /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
    const memory = localStorage.getItem('memory');
    const userData = memory ? JSON.parse(memory) : { answers: {} };

    function hide(domElement) {
        domElement.style.display = 'none';
    }
    function show(domElement) {
        domElement.style.display = '';
    }
    function focusWindow() {
        setTimeout(() => window.scrollTo(0,0), 0);
    }
    const $ = selector => document.querySelectorAll(selector);
    Array.from($('.panel__next')).forEach((node) => {
        node.addEventListener('click', (ev) => {
            ev.stopPropagation();
            focusWindow();
        });
    });
    const boot = (action) => {
        action = action || init(userData);
        show($('#chrome__content__panel-two')[0]);
        show($('#chrome__content__panel-two')[0].parentNode);
        focusWindow();
        store.dispatch(action);
        focusWindow();
    };
    const hash = window.location.hash;
    const initGameEl = document.querySelector('#init-game');
    hide($('#app-loading-indicator')[0]);
    if (process.env.DEV) {
        boot();
    } else if (initGameEl) {
        if (!hash) {
            window.location.hash = '#panel-6';
            focusWindow();
        } else if (!document.querySelector(decodeURIComponent(hash))) {
            // If the hash fragment is pointing to something that's not an element.
            boot();
            const char = decodeURIComponent(hash.replace('#', ''));
            store.dispatch(showCharacterOverlay(char));
        }
        initGameEl.addEventListener('click', () => {
            boot();
        });
    } else {
        // dev mode
        boot();
    }
}());

