import dictJson from './../data/dictionary.json'
import DictionaryUtils from './../data/DictionaryUtils';

export default class Dictionary {
  maxSize() {
    return Object.keys( dictJson.words ).length;
  }
  constructor() {
    const self = this;
    this.data = {};
    this.keys = [];
    this.utils = new DictionaryUtils( dictJson.words,
      dictJson.decompositions, dictJson.difficulty );
  }
  size() {
    return Object.keys( this.data ).length;
  }
  /**
   * Expands a dictionary of all words of a given size
   * @param {Number} unitSize
   * @param {Number} difficultyLevel
   * @return {Promise}
   */
  expand(unitSize, difficultyLevel = 0) {
    const utils = this.utils;
    let words = this.utils.getWords(unitSize, difficultyLevel).
      // jumble up
      sort( () => Math.random() < 0.5 ? -1 : 1 );

    let data = {};
    words.forEach((word) => {
      data[word] = utils.getWord( word );
    })
    this.keys = this.keys.concat( Object.keys( data ).sort() );
    Object.assign( this.data, data );
  }
 /**
  * Deal the cards from the deck starting with the offset
  * @param {Number} offset
  * @param {Number} total to return
  * @return {Object}
  */
  deal(offset, total) {
    const subset = {};
    this.keys.slice(offset, offset + total).forEach((key) => {
      subset[key] = this.data[key];
    });
    return subset;
  }
  /**
  * Decompose a word into its parts. If not able to do so (due to an incomplete http
  * request) return empty array. This is rare, should only happen early on.
  * @param {String}
  * @return {String[]}
  */
  toRadicals(word) {
    if ( !this.decompositions ) {
      return [];
    } else {
      return this.decompositions[word] || [];
    }
  }
  /**
   * Translates a string
   * @param {Number} unitSize
   * @param {String}
   */
  toEnglish(word) {
    return this.data[word];
  }
}
