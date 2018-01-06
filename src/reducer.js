/** @jsx h */
import { Component, h } from 'preact';

import actionTypes from './actionTypes';
import Memory from './Memory'
import Dealer from './Dealer'
import Dictionary from './Dictionary'
import CharacterPreviewOverlay from './CharacterPreviewOverlay'

function loadMemory() {
  const memory = localStorage.getItem('memory');
  return memory ? JSON.parse( memory ) : false;
}

function saveMemory(newMemory) {
  localStorage.setItem('memory', JSON.stringify(newMemory));
}

// Setups state with the required globals for managing a game
function actionBoot() {
  const dict = new Dictionary();
  const mem = new Memory(loadMemory(), saveMemory);

  return {
    dictionary: dict,
    dealer: new Dealer( dict, mem ),
    memory: mem
  };
}

// updates state to add the character preview overlay overlay
function actionRevealPronounciation( state, char ) {
  return Object.assign( {}, state, {
    overlay: <CharacterPreviewOverlay char={char} />
  } );
}

// clears the current overlay
function clearOverlay( state ) {
  return Object.assign( {}, state, {
    overlay: null
  } );
}

export default ( state, action ) => {
  switch ( action.type ) {
    case actionTypes.REVEAL_FLASHCARD_PRONOUNCIATION.type:
      return actionRevealPronounciation( state, action.char );
    // reset on boot
    case actionTypes.CLICK_ROOT_NODE.type:
      return clearOverlay( state );
    // reset on boot
    case actionTypes.BOOT.type:
      return actionBoot();
    default:
      return state;
  }
};
