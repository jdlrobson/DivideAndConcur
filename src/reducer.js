/** @jsx h */
import { Component, h } from 'preact';

import actionTypes from './actionTypes';
import Memory from './Memory'
import Dealer from './Dealer'
import Dictionary from './Dictionary'
import CharacterPreviewOverlay from './CharacterPreviewOverlay'

let memory;
let dealer;
let dict;

function loadMemoryData() {
  const memory = localStorage.getItem('memory');
  return memory ? JSON.parse( memory ) : false;
}

function saveMemoryData(newMemory) {
  localStorage.setItem('memory', JSON.stringify(newMemory));
}

// Setups state with the required globals for managing a game
function actionBoot() {
  dict = new Dictionary();
  memory = new Memory(loadMemoryData(), saveMemoryData);
  dealer = new Dealer( dict, memory );
  dealer.load(0, 0);

  return {
    dictionary: dict,
    dealer: dealer,
    memory: memory,
    answered: 0,
    round: 0,
    score: memory.getScore()
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

// Reducer for when a card is answered
function actionAnswerCard( state, action ) {
  const char = action.char;

  switch ( action.type ) {
    case actionTypes.GUESS_FLASHCARD_WRONG.type:
      memory.markAsDifficult( char );
    case actionTypes.GUESS_FLASHCARD_RIGHT.type:
      memory.markAsEasy( char );
  }
  return Object.assign( {}, state, {
    score: memory.getScore(),
    highlighted: dict.toRadicals( char ),
    answered: state.answered + 1
  } );
}

/**
 * Deal ten cards from the dictionary that the user is unfamiliar with
 * sorted by difficulty level
 */
function dealCards( state ) {
  const cards = dealer.deal();
  const level = dealer.getLevel();
  const previous = dealer.getHistory();
  const wordSize = dealer.currentWordSize;
  const difficulty = dealer.currentDifficultyLevel;

  return Object.assign( {}, state, {
    round: state.round + 1,
    answered: 0,
    wordSize, difficulty, level, cards, previous
  })
}

export default ( state, action ) => {
  switch ( action.type ) {
    case actionTypes.DEAL_CARDS.type:
      return dealCards( state );
    case actionTypes.GUESS_FLASHCARD_WRONG.type:
    case actionTypes.GUESS_FLASHCARD_RIGHT.type:
      return actionAnswerCard( state, action );
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
