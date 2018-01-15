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
