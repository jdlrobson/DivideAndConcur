import 'preact/devtools';

import { applyMiddleware, compose, createStore } from 'redux';
import { checkForSave, checkForBoot,
    checkForTimedAction, checkIfEndOfRound } from './subscribers';

import { init, answerAllCardsInRound, highlightCharacter } from './actions';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';

import img from './../panda.gif';
import logo from './../logo.png';

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
    store.subscribe(checkForBoot(store));

    /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
    const memory = localStorage.getItem('memory');
    const userData = memory ? JSON.parse(memory) : { answers: {} };


    function loadImages(imgs) {
        return Promise.all(
            imgs.map((src) => {
                return new Promise((resolve) => {
                    const image = new Image();
                    if ( image.loaded ) {
                        resolve();
                    }
                    image.oncomplete = ()=>resolve();
                    image.onload = ()=>resolve();
                    image.src = src;
                });
            })
        );
    }
    const boot = () => {
        setTimeout(() => {
            store.dispatch(init(userData))
        }, 3000);
    };
    loadImages([img,logo]).then(boot);
}());

