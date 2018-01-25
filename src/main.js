import { h, render, Component } from 'preact';
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'preact-redux'
import GameChooser from './ui/GameChooser'

import reducer from './reducer'
import { checkIfEndOfRound, checkForSave,
  checkIfPinyinNeeded, checkForTimedAction } from './subscribers';

import actionTypes from './actionTypes'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore( reducer,
  composeEnhancers(
    applyMiddleware( thunkMiddleware )
  )
);

import 'preact/devtools'

function action(actionType, data) {
  return Object.assign( {}, {
    type: typeof actionType === 'string' ? actionType : actionType.type
  }, data );
}

(function () {
  /**
   *******************************************
   * SUBSCRIBERS to all state changes
   *******************************************
   */
  const renderGame = () => {
    document.getElementById('container').innerHTML = '';
    render(
      <Provider store={store}>
        <GameChooser actionTypes={actionTypes} />,
       </Provider>,
      document.getElementById('container')
   );
  }

  // setup subscribers
  store.subscribe( checkIfEndOfRound( store ) );
  store.subscribe( checkForTimedAction( store ) );
  store.subscribe( checkForSave( store ) );

  /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
  const memory = localStorage.getItem('memory');
  const userData = memory ? JSON.parse( memory ) : false;

  store.dispatch( action( actionTypes.BOOT, { userData } ) );
  renderGame();
}());

