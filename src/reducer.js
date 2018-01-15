/** @jsx h */
import { Component, h } from 'preact';

import actionTypes from './actionTypes';
import Memory from './Memory'
import Dictionary from './Dictionary'

import CharacterPreviewOverlay from './ui/CharacterPreviewOverlay'
import { FLIP_CARDS, MATCH_PAIRS } from './ui/GameChooser'

const NUM_CARDS_PER_LEVEL = 10;
let memory;
let dealer;
let dict;

function loadMemoryData() {
  const memory = localStorage.getItem('memory');
  return memory ? JSON.parse( memory ) : false;
}

// Setups state with the required globals for managing a game
function actionBoot() {
  dict = new Dictionary();
  memory = new Memory(loadMemoryData());

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
    highlighted: dict.toRadicals( char )
  } );
}

function mapCard( character, isHighlighted ) {
  const difficultyLevel = memory.getDifficulty(character);
  return {
    isKnown: memory.knowsWord( character ),
    character,
    isHighlighted,
    difficultyLevel,
    english: dict.utils.getWord(character)
  };
}

function addKnownWordCount(state) {
  const prev = state.previous;
  const cards = state.cards;
  const knownWordCount = cards.filter((card)=>card.isKnown).length + prev.length;

  return Object.assign({}, state, { knownWordCount } );
}

function makeCardsFromCharacters(state, chars) {
  return chars.map((char) => mapCard(char, state.highlighted.indexOf(char) > -1));
}

function findPackStartPosition( pack ) {
  let i = 0;
  while( memory.knowsWord( pack[i] ) ) {
    i += 1;
  }
  return i;
}

function fastForwardToPackPosition( state ) {
  const difficulty = state.difficulty;
  const wordSize = state.wordSize;
  const pack = dict.utils.getWords(wordSize, difficulty);
  const packPosition = findPackStartPosition(pack);
  const previous = state.previous || [];


  if ( pack.length === 0 ) {
    // we ran out on this difficulty
    throw 'ow end of radicals';
  } else if ( packPosition >= pack.length ) {
    return fastForwardToPackPosition( {
      wordSize,
      previous: pack.concat( previous ),
      difficulty: difficulty + 1
    } )
  } else {
    return {
      pack,
      previous,
      packPosition,
      wordSize,
      difficulty
    };
  }
}

/**
 * Deal ten cards from the dictionary that the user is unfamiliar with
 * sorted by difficulty level
 */
function dealCards( state ) {
  const position = fastForwardToPackPosition(Object.assign({}, state,
    { difficulty: 0, wordSize: 0, previous: [] } ));
  const pack = position.pack;
  const packPosition = position.packPosition;
  const cards = makeCardsFromCharacters( state, pack.slice( packPosition, packPosition + NUM_CARDS_PER_LEVEL ) );
  const answeredCardsInCurrentPack = pack.slice( 0, packPosition );
  const previous = makeCardsFromCharacters( state, answeredCardsInCurrentPack.concat( position.previous ) );

  // if all have been answered lets deal again..
  return addKnownWordCount(
    Object.assign( {}, state, position, {
      cards, previous
    })
  );
}

function setGame( state, action ) {
  return {
    game: action ? action.game : FLIP_CARDS,
    highlighted: [],
    cards: [],
    maxSize: dict.maxSize()
  };
}

function updateCardInCards( cards, action, props ) {
  return cards.map((card, i) => {
    return action.character === card.character && action.index === i ?
      Object.assign( {}, card,  props ) : card;
  } );
}

function markCardsAsAnswered( cards, character, isKnown ) {
  return cards.map((card, i) => {
    return character === card.character ?
      Object.assign( {}, card,  { isAnswered: true, isKnown } ) : card;
  } );
}

function deselectUnansweredCards( cards ) {
  return cards.map((card, i) => {
    return card.isSelected && !card.isAnswered ?
      Object.assign( {}, card,  { isSelected: false } ) : card;
  } );
}

function pausePlay( state ) {
  return Object.assign( {}, state, { isPaused: true } );
}

function addTimedAction( state, timedAction ) {
  return Object.assign( {}, state, { isPaused: true,
    timedAction } );
}

function queueDeselectOfUnansweredCards( state ) {
  return addTimedAction( state, actionTypes.DESELECT_ALL_UNANSWERED_CARDS.type );
}

function actionDeselectUnansweredCards( state ) {
  return Object.assign( {}, state, {
    isPaused: false,
    cards: deselectUnansweredCards( state.cards )
  } );
}

function revealedFlashcardPairGame(state, action) {
  state = revealCardInAction(state, action);
  let selectedCards = state.cards.filter((card)=>card.isSelected && !card.isAnswered);
  if ( selectedCards.length === 2 ) {
    let cards;

    if ( selectedCards[0].character === selectedCards[1].character ) {
      memory.markAsEasy( action.character );
      cards = markCardsAsAnswered( state.cards, action.character, true );
    } else {
      return queueDeselectOfUnansweredCards( pausePlay( state ) );
    }
    return Object.assign( {}, state, { cards } );
  }
  return state;
}

function revealCardInAction(state, action) {
  return Object.assign( {}, state, {
    cards: updateCardInCards( state.cards, action, { isSelected: true } )
  } );
}

function revealedFlashcard( state, action ) {
  if (  state.game === MATCH_PAIRS ) {
    return revealedFlashcardPairGame(state, action);
  }  else {
    return revealCardInAction(state, action);
  }
}

function freezeCards(state) {
  const isFrozen = true;
  return Object.assign({}, state, {
    cards: state.cards.map((card) => Object.assign({}, card, { isFrozen } ))
  });
}

function shuffleCards(state) {
  return Object.assign({}, state, {
    cards: state.cards.sort((a,b) => Math.random() < 0.5 ? -1 : 1)
  });
}
function cloneCards(state) {
  const cards = state.cards;
  return Object.assign( {}, state, {
    cards: cards.concat(cards)
  } );
}

function addIndexToCards(state) {
  return Object.assign( {}, state, {
    cards: state.cards.map((card, i) => Object.assign({}, card, { index: i } ))
  } )
}

function requestSave(state) {
  // @todo: Move to subscriber when Memory class has been moved into state
  localStorage.setItem('memory', JSON.stringify( memory.toJSON() ));
  return Object.assign({}, state, { isDirty: true } );
}
function saveDone(state) {
  return Object.assign({}, state, { isDirty: false } );
}

function newRound(state) {
  if ( state.game === MATCH_PAIRS ) {
    return requestSave(
      addTimedAction(
        addIndexToCards( shuffleCards( freezeCards( cloneCards( dealCards( state ) ) ) ) ),
        actionTypes.FLIP_CARDS.type
      )
    );
  } else {
    return requestSave( addIndexToCards(dealCards( state )) );
  }
}
function flipCards(state) {
  const cards = state.cards.map((card) => Object.assign({}, card, { isFlipped: true, isSelected: false }));
  return Object.assign({}, state, { cards } );
}

export default ( state, action ) => {
  switch ( action.type ) {
    case actionTypes.FLIP_CARDS.type:
      return flipCards(state);
    case actionTypes.SAVE_COMPLETE.type:
      return saveDone(state);
    case actionTypes.DESELECT_ALL_UNANSWERED_CARDS.type:
      return actionDeselectUnansweredCards( state, action );
    case actionTypes.CLEAR_TIMED_ACTION.type:
      return Object.assign({}, state, { timedAction: undefined } );
    case actionTypes.REVEAL_FLASHCARD.type:
      return state.isPaused ? state : revealedFlashcard( state, action );
    case actionTypes.SWITCH_GAME.type:
      return setGame( state, action );
    case actionTypes.END_ROUND.type:
    case actionTypes.START_ROUND.type:
      return newRound(state);
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
    default:
      return state;
  }
};
