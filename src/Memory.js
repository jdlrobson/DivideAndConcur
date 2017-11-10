const SCORE_INCORRECT_ANSWER = -2
const SCORE_CORRECT_ANSWER = 1
const ROUNDS_BEFORE_KNOWN = 3

export default class Memory {
  constructor(initialMemory, saveFunction) {
    if ( initialMemory ) {
      this.answers = initialMemory.answers || {};
      this.stack = initialMemory.stack || false;
    } else {
      this.answers = {};
      this.stack = false;
    }
    this.saveFunction = saveFunction;
    this.score = this.getScore();
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
  saveMemory() {
    if ( this.saveFunction ) {
      this.saveFunction({ answers: this.answers });
    }
  }
  markAsDifficult( char ) {
    if ( !this.answers[char] ) {
      this.answers[char] = 0;
    }
    this.answers[char]++;
    this.score += SCORE_INCORRECT_ANSWER;
    this.saveMemory();
  }
  getScore() {
    if ( this.score ) {
      return this.score;
    } else {
      return Object.keys( this.answers ).reduce((accumulator, key) => {
        const val = this.answers[key];
        return accumulator + ( val < 0 ? ( Math.abs(val) * SCORE_CORRECT_ANSWER ) :
          ( val * SCORE_INCORRECT_ANSWER ) );
      }, 0);
    }
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
    this.score += SCORE_CORRECT_ANSWER;
    this.answers[char]--;
    this.saveMemory();
  }
}
