import { h, render, Component } from 'preact';
import { createStore } from 'redux'

import GameChooser from './ui/GameChooser'

import reducer from './reducer'
import { checkIfEndOfRound, checkIfPinyinNeeded } from './subscribers';

import actionTypes from './actionTypes'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */
const store = createStore( reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() );

import 'preact/devtools'


(function () {
  /**
   *******************************************
   * SUBSCRIBERS to all state changes
   *******************************************
   */
  const renderGame = () => {
    document.getElementById('container').innerHTML = '';
    render(
      <GameChooser
        store={store}
        dispatch={store.dispatch}
        actionTypes={actionTypes}
      />,
      document.getElementById('container')
    );
  }

  // setup subscribers
  store.subscribe( checkIfEndOfRound( store ) );
  store.subscribe( checkIfPinyinNeeded( store ) );

  /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
  store.dispatch( actionTypes.BOOT );
  renderGame();
}());

