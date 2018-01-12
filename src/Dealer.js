export const NUM_CARDS_PER_LEVEL = 10;

export default class Dealer {
  constructor( dictionary, memory ) {
    this.dictionary = dictionary;
    this.memory = memory;
  }
  get currentDifficultyLevel() {
    return this._difficulty;
  }
  get currentWordSize() {
    return this._wordSize;
  }
  load(wordSize, wordDifficulty) {
    const deal = this.deal.bind( this );
    const dictionary = this.dictionary;
    const loadDeck = this.load.bind( this );
    this._difficulty = wordDifficulty;
    this._wordSize = wordSize;

    // Load the dictionary
    const previousSize = dictionary.size();
    dictionary.expand(wordSize, wordDifficulty);
    if ( dictionary.size() === previousSize ) {
      if ( wordDifficulty === 0 ) {
        throw 'reached end of game';
      } else {
        return loadDeck( wordSize + 1, 0 );
      }
    }
  }
  getLevel() {
    return this.level;
  }
  getHistory() {
    return this.history;
  }
  /**
   * Deal ten cards from the dictionary that the user is unfamiliar with
   * sorted by difficulty level
   */
  deal() {
    const memory = this.memory;
    const dictionary  = this.dictionary;
    let offset = 0;
    let level = 1;
    let curDict = dictionary.deal(offset, NUM_CARDS_PER_LEVEL);
    let previous = [];
    let currentWords = Object.keys( curDict );

    while ( currentWords.length && memory.knowsWords( currentWords ) ) {
      offset += NUM_CARDS_PER_LEVEL;
      previous.push( Object.keys( curDict ) );
      curDict = dictionary.deal(offset, NUM_CARDS_PER_LEVEL);
      currentWords = Object.keys( curDict );
      level += 1;
    }
    this.level = level;
    this.history = previous.reverse();

    // We now have a dictionary of 10 words that the user doesn't know.

    const cards = Object.keys( curDict ).sort((char, char2) => {
      // sort by difficulty
      return memory.getDifficulty(char) < memory.getDifficulty(char2) ? 1 : -1;
    });
    return cards;
  }
}