export default class Dictionary {
  constructor() {
    const self = this;
    this.data = {};
    this.keys = [];
    fetch( '/decompositions' ).then((res) => { return res.json(); } ).
      then((json)=>{ self.decompositions = json } );
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
    const self = this;

    return fetch('/data/' + unitSize +'/' + difficultyLevel).then((r) => {
      return r.json();
    }).then((r) => {
      self.keys = self.keys.concat( Object.keys( r ).sort() );
      Object.assign( self.data, r );
      return self;
    });
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