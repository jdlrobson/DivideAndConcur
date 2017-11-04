export default class Dictionary {
  constructor() {
    this.data = {};
    this.keys = [];
  }
  /**
   * Loads a dictionary of all words of a given size
   * @param {Number} unitSize
   * @return {Promise}
   */
  load(unitSize) {
    const self = this;

    return fetch('/data/' + unitSize).then((r) => {
      return r.json();
    }).then((r) => {
      self.data = r;
    })
  }
 /**
  * Deal the cards from the deck starting with the offset
  * @param {Number} offset
  * @param {Number} total to return
  * @return {Object}
  */
  deal(offset, total) {
    const subset = {};
    // Something to think about later..
    // Sorting needs to be predictable and fixed
    // That said.. should be by difficulty not alphabetical.. right?
    Object.keys( this.data ).sort().slice(offset, offset + total).forEach((key) => {
      subset[key] = this.data[key];
    });
    return subset;
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