const BOOT = {
  type: 'BOOT',
  text: 'Load the game'
};

const SAVE_PROGRESS = {
  type: 'SAVE-PROGRESS',
  text: 'Save progress in the game'
}

const REQUEST_PINYIN_START = {
  type: 'REQUEST_PINYIN_START'
};

const REVEAL_FLASHCARD = {
  type: 'REVEAL-FLASHCARD',
  text: 'A flashcard was clicked'
};

const CLICK_ROOT_NODE = {
  type: 'CLICK-ROOT-NODE',
  text: 'Clicked the root node'
};

const GUESS_FLASHCARD_RIGHT = {
  type: 'GUESS_FLASHCARD_RIGHT'
};

const GUESS_FLASHCARD_WRONG = {
  type: 'GUESS_FLASHCARD_WRONG'
};

const START_ROUND = {
  type: 'START_ROUND'
};

const END_ROUND = {
  type: 'END_ROUND'
};

export default {
  BOOT,
  CLICK_ROOT_NODE,
  START_ROUND,
  END_ROUND,
  GUESS_FLASHCARD_RIGHT,
  GUESS_FLASHCARD_WRONG,
  REVEAL_FLASHCARD,
  REQUEST_PINYIN_START,
  SAVE_PROGRESS
};