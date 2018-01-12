/** @jsx h */
import { Component, h } from 'preact';

import actionTypes from './actionTypes';
import Memory from './Memory'
import Dealer from './Dealer'
import Dictionary from './Dictionary'

import CharacterPreviewOverlay from './ui/CharacterPreviewOverlay'
import { FLIP_CARDS } from './ui/GameChooser'

let memory;
let dealer;
let dict;

function loadMemoryData() {
  const memory = localStorage.getItem('memory');
  return memory ? JSON.parse( memory ) : false;
}

function saveMemoryData(newMemory) {
  localStorage.setItem('memory', JSON.stringify( memory.toJSON() ));
}

// Setups state with the required globals for managing a game
function actionBoot() {
  dict = new Dictionary();
  memory = new Memory(loadMemoryData());
  dealer = new Dealer( dict, memory );
  dealer.load(0, 0);

  return setGame();
}

// updates state to add the character preview overlay overlay
function actionRevealPronounciation( state, action ) {
  let charWithoutPinyin;
  const char = action.char;

  if ( action.pinyin === undefined ) {
    charWithoutPinyin = char;
  }
  return Object.assign( {}, state, {
    charWithoutPinyin,
    overlay: <CharacterPreviewOverlay char={char} pinyin={action.pinyin} />
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
    highlighted: dict.toRadicals( char ),
    answered: state.answered + 1
  } );
}

function mapCard( character, isHighlighted ) {
  return {
    character,
    isHighlighted,
    difficultyLevel: memory.getDifficulty(character),
    english: dict.toEnglish(character)
  };
}
/**
 * Deal ten cards from the dictionary that the user is unfamiliar with
 * sorted by difficulty level
 */
function dealCards( state ) {
  const cards = dealer.deal().map((char)=>mapCard(char, state.highlighted.indexOf(char) > -1));
  const level = dealer.getLevel();
  const previous = dealer.getHistory().map((round) => round.map((char)=>mapCard(char, state.highlighted.indexOf(char) > -1)));
  const wordSize = dealer.currentWordSize;
  const difficulty = cards.length ? dealer.currentDifficultyLevel
    : dealer.currentDifficultyLevel + 1;

  saveMemoryData();
  // The current deck was depleted so let's get a new deck
  if ( !cards.length ) {
    dealer.load( wordSize, difficulty );

    return Object.assign( {},
      dealCards( state ),
      { difficulty }
    );
  } else {
    // if all have been answered lets deal again..
    return Object.assign( {}, state, {
      round: state.round + 1,
      answered: 0,
      knownWordCount: memory.knownWordCount(),
      wordSize, difficulty, level, cards, previous
    })
  }
}

function setGame( state, action ) {
  return {
    game: action ? action.game : FLIP_CARDS,
    highlighted: [],
    maxSize: dict.maxSize(),
    answered: 0,
    round: 0
  };
}

export default ( state, action ) => {
  switch ( action.type ) {
    case actionTypes.SWITCH_GAME.type:
      return setGame( state, action );
    case actionTypes.START_ROUND.type:
      return dealCards( state );
    case actionTypes.GUESS_FLASHCARD_WRONG.type:
    case actionTypes.GUESS_FLASHCARD_RIGHT.type:
      return actionAnswerCard( state, action );
    case actionTypes.REQUEST_PINYIN_START.type:
    case actionTypes.REQUEST_PINYIN_END.type:
      return actionRevealPronounciation( state, action );
    // reset on boot
    case actionTypes.CLICK_ROOT_NODE.type:
      return clearOverlay( state );
    // reset on boot
    case actionTypes.BOOT.type:
      return actionBoot();
    case actionTypes.END_ROUND.type:
      return dealCards( state );
    default:
      return state;
  }
};
