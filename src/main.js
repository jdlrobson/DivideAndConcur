import 'preact/devtools';

import { applyMiddleware, compose, createStore } from 'redux';
import { checkForSave, checkForBoot,
    speakHighlightedWord,
    checkForTimedAction, checkIfEndOfRound } from './subscribers';

import { init, answerAllCardsInRound, highlightCharacter } from './actions';
import { STARTUP_WAIT_TIME } from './constants';
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
        if ( ev.type === 'paste' ) {
            keys = keys.concat(ev.clipboardData.getData('text/plain'));
        } else {
           keys.push(ev.key); 
        }
        const code = keys.join('');
        const cards = store.getState().cards;
        if (code.indexOf('JRG') > -1) {
            keys = [];
            store.dispatch(answerAllCardsInRound(false, cards));
        } else if (code.indexOf('JRH') > -1) {
            keys = [];
            store.dispatch(answerAllCardsInRound(true, cards));
        } else if ( code.indexOf( 'LC' ) > -1 ) {
            const char = code.slice(code.indexOf( 'LC' )+2);
            if ( char ) {
                store.dispatch(highlightCharacter(char));
                if ( char.length === 2 ) {
                    keys = [];
                }
            }
        }
        if (keys.length > 10) {
            keys = keys.slice(-10);
        }

    };
    document.body.onpaste = checkCheatCode;
    window.onkeypress = checkCheatCode;

    // setup subscribers
    store.subscribe(checkIfEndOfRound(store));
    store.subscribe(checkForSave(store));
    store.subscribe(checkForBoot(store, () => {
        hide( $('#chrome__content__panel-one')[0] );
    }));
    store.subscribe(speakHighlightedWord(store));

    /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
    const memory = localStorage.getItem('memory');
    const SEEN_KEY = 'y-seen';
    const seen = localStorage.getItem(SEEN_KEY);
    const userData = memory ? JSON.parse(memory) : { answers: {} };

    function hide( domElement ) {
        domElement.style.display = 'none';
    }
    function show( domElement ) {
        domElement.style.display = '';
    }
    function focusWindow() {
        setTimeout(()=>window.scrollTo(0,0), 0);
    }
    const $ = (selector) => document.querySelectorAll(selector);
    Array.from($('.panel__next')).forEach((node) => {
        node.addEventListener('click', (ev) => {
            ev.stopPropagation();
            focusWindow();
        });
    })
    const boot = () => {
        show( $('#chrome__content__panel-two')[0] );
        show( $('#chrome__content__panel-two')[0].parentNode );
        localStorage.setItem(SEEN_KEY, '1');
        focusWindow();
        store.dispatch(init(userData));
        focusWindow();
    };
    if ( !window.location.hash ) {
        window.location.hash = seen ? '#panel-6' : '#panel-1';
        focusWindow();
    }
    document.querySelector('#init-game').addEventListener('click', () => {
        boot();
    });
}());

