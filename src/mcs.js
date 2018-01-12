require('isomorphic-fetch');

/**
 * Extract the pinyin from the HTML assuming a few things
 * about the structure - the node containing the pinyin is
 * the link after the link to pinyin or is a link inside
 * .pinyin-ts-form-of
 */
function extractPinyin(text) {
  let textContent;
  const node = document.createElement( 'div' );
  node.innerHTML = text;

  // e.g. https://en.wiktionary.org/wiki/%E8%89%B9
  const pinyinNode = node.querySelector( '.pinyin-ts-form-of a:first-child' );
  if ( pinyinNode ) {
    return pinyinNode.textContent;
  }
  // else do it the harder way...
  const nodes = node.querySelectorAll( 'a' );
  Array.from( nodes ).forEach( ( anchor, i ) => {
    if (anchor.textContent.toLowerCase() === 'pinyin' ) {
      textContent = nodes[i+1].textContent;
    }
  } );
  return textContent || text;
}

function lookup(character, lines) {
  return fetch('https://en.wiktionary.org/api/rest_v1/page/mobile-sections/' + encodeURIComponent(character))
      .then((res) => res.json())
      .then((json) => {
        let text = '';
        let isChinese = false;
        let chineseLevel;
        if ( json && json.remaining && json.remaining.sections ) {
          json.remaining.sections.forEach((section) => {
            if ( isChinese && section.toclevel === chineseLevel ) {
              isChinese = false;
            }
            if ( section.line === 'Chinese' ) {
              isChinese = true;
              chineseLevel = section.toclevel;
            }
            if ( isChinese ) {
              if ( lines.indexOf(section.line) > -1 ) {
                text += section.text;
              }
            }
          });
        }
        return extractPinyin(text);
      } );
}

module.exports = {
  getDefinition: function ( character ) {
    return lookup( character, [ 'Definitions', 'Definition' ] )
  },
  getPronounciation: function ( character ) {
    return lookup( character, [ 'Pronunciation' ] )
  }
};