import { h, render, Component } from 'preact';
import { createStore } from 'redux'

import Game from './Game'

import reducer from './reducer'

import actionTypes from './actionTypes'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */
const store = createStore( reducer );

import 'preact/devtools'

(function () {
  let memory = localStorage.getItem('memory');
  memory = memory ? JSON.parse( memory ) : false;

  function saveMemory(newMemory) {
    localStorage.setItem('memory', JSON.stringify(newMemory));
  }

  /**
   *******************************************
   * SUBSCRIBERS to all state changes
   *******************************************
   */
  const renderGame = () => {
    console.log('render');
    document.getElementById('container').innerHTML = '';
    render(
      <Game initialMemory={memory} saveMemory={saveMemory}
        store={store}
        actionTypes={actionTypes}
      />,
      document.getElementById('container')
    );
  }

  /**
   *******************************************
   * DISPATCH initial event(s)
   *******************************************
   */
  store.dispatch( actionTypes.BOOT );
  renderGame();
}());

