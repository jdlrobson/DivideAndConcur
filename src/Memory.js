const ROUNDS_BEFORE_KNOWN = 1

export default class Memory {
  constructor(initialMemory) {
    if ( initialMemory ) {
      this.answers = initialMemory.answers || {};
      this.stack = initialMemory.stack || false;
    } else {
      this.answers = {};
      this.stack = false;
    }
  }
  toJSON() {
    return { answers: this.answers }
  }
  knownWordCount() {
    return Object.keys( this.answers ).length;
  }
  /**
   * Check if the user knows all the words
   * @param {Array} words
   * @return {Boolean}
   */
  knowsWords(words) {
    var answers = this.answers;
    /**
     * @param {String} words
     */
    function knowsWord(word) {
      return answers[word] <= -ROUNDS_BEFORE_KNOWN;
    }

    return words.reduce((accumulator, word)=> {
      return knowsWord(word) && accumulator;
    }, true );
  }
  markAsDifficult( char ) {
    if ( !this.answers[char] ) {
      this.answers[char] = 0;
    }
    this.answers[char]++;
  }
  getDifficulty( char ) {
    if ( this.answers[char] > 0 ) {
      return this.answers[char] ? Math.min( this.answers[char], ROUNDS_BEFORE_KNOWN ) : 0;
    } else {
      return this.answers[char] ? Math.max( this.answers[char], -ROUNDS_BEFORE_KNOWN ) : 0;
    }
  }
  markAsEasy( char ) {
    if ( !this.answers[char] ) {
      this.answers[char] = 0;
    }
    this.answers[char]--;
  }
}
