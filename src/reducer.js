/** @jsx h */
import { Component, h } from 'preact';

import actionTypes from './actionTypes';
import Memory from './Memory'
import Dealer, { NUM_CARDS_PER_LEVEL } from './Dealer'
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
  const char = action.character;

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
  const char = action.character;
  const isAnswered = true;
  let isKnown = true;

  switch ( action.type ) {
    case actionTypes.GUESS_FLASHCARD_WRONG.type:
      memory.markAsDifficult( char );
      isKnown = false;
    case actionTypes.GUESS_FLASHCARD_RIGHT.type:
      memory.markAsEasy( char );
  }

  return Object.assign( {}, state, {
    cards: updateCardInCards( state.cards, action, { isAnswered, isKnown } ),
    highlighted: dict.toRadicals( char ),
    answered: state.answered + 1
  } );
}

function mapCard( character, isHighlighted, index ) {
  const difficultyLevel = memory.getDifficulty(character);
  return {
    character,
    index,
    isHighlighted,
    difficultyLevel,
    english: dict.toEnglish(character)
  };
}
/**
 * Deal ten cards from the dictionary that the user is unfamiliar with
 * sorted by difficulty level
 */
function dealCards( state ) {
  const cards = dealer.deal().map((char, i)=>mapCard(char, state.highlighted.indexOf(char) > -1, i));
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
  } else if ( cards.length < NUM_CARDS_PER_LEVEL ) {
      dealer.load( wordSize, difficulty + 1 );
      return Object.assign( {}, dealCards( state ), { difficulty: difficulty + 1 } );
  } else {
    // if all have been answered lets deal again..
    return Object.assign( {}, state, {
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
    answered: 0
  };
}

function updateCardInCards( cards, action, props ) {
  return cards.map((card, i) => {
    return action.character === card.character && action.index === i ?
      Object.assign( {}, card,  props ) : card;
  } );
}

function revealedFlashcard( state, action ) {
  return Object.assign( {}, state, {
    cards: updateCardInCards( state.cards, action, { isSelected: true } )
  } );
}

export default ( state, action ) => {
  switch ( action.type ) {
    case actionTypes.REVEAL_FLASHCARD.type:
      return revealedFlashcard( state, action );
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
