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

export default {
  BOOT,
  CLICK_ROOT_NODE,
  REVEAL_FLASHCARD,
  REVEAL_FLASHCARD_PRONOUNCIATION,
  SAVE_PROGRESS
};
