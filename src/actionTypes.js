const BOOT = {
  type: 'BOOT',
  text: 'Load the game'
};

const SAVE_PROGRESS = {
  type: 'SAVE-PROGRESS',
  text: 'Save progress in the game'
}

const REVEAL_FLASHCARD_PRONOUNCIATION = {
  type: 'REVEAL-FLASHCARD-PRONOUNCIATION'
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

export default {
  BOOT,
  CLICK_ROOT_NODE,
  GUESS_FLASHCARD_RIGHT,
  GUESS_FLASHCARD_WRONG,
  REVEAL_FLASHCARD,
  REVEAL_FLASHCARD_PRONOUNCIATION,
  SAVE_PROGRESS
};
