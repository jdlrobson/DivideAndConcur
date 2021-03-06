/** @jsx h */
import { Component, h } from 'preact';
import Card from '../Card';
import './styles.less';

const getPoemCharacterClass = (char, { knownWords, seenWords, hardWords }, isValidCharacter) => {
    const classes = [];
    if ([ '，', '。', '；', '、' ].includes(char)) {
        return 'poem__verse--special';
    }
    if (!isValidCharacter) {
        return 'poem__verse--invalid';
    }
    if (knownWords.includes(char)) {
        classes.push('poem__verse__card--known');
    }
    if (seenWords.includes(char)) {
        classes.push('poem__verse__card--seen');
    } else {
        classes.push('poem__verse__card--unseen');
    }
    if (hardWords.includes(char)) {
        classes.push('poem__verse__card--hard');
    }
    return classes.join(' ');
}

const textToCharacters = (line, validChars) => {
    const characters = [];
    let inspected = 0;
    Array.from(line).forEach((char, i, chars) => {
        let possibleWord;

        if ( inspected > i ) {
            // next.
            return;
        } else {
            const nextChar = chars[i+1];
            const nextNextChar = chars[i+2];

            // any three character words?
            if (nextNextChar) {
                possibleWord = `${char}${nextChar}${nextNextChar}`;
                if ( validChars.includes(possibleWord) ) {
                    inspected += 2;
                    characters.push(possibleWord);
                    return;
                }
            }
            // any two character words?
            if (nextChar) {
                possibleWord = `${char}${nextChar}`;
                if ( validChars.includes(possibleWord) ) {
                    inspected += 1;
                    characters.push(possibleWord);
                    return;
                }
            }
            characters.push(char);
        }
    })

    return characters;
};


const Poem = ({ knownWords, seenWords, hardWords, poem, words }) => {
    const lines = poem.split('\n');
    const validChars = words.map((w) => w.character);

    return <div class="poem">
        {lines.map((line) => {
            let i = 0;
            return <div class="poem__verse">{
                textToCharacters(line, validChars).map((character) => {
                    const isValidCharacter = validChars.includes(character);
                    i += Array.from(character).length;
                    let className = getPoemCharacterClass(character, { knownWords, seenWords, hardWords }, isValidCharacter);

                    if ( i > 6 ) {
                        i = 0;
                        className += ' poem__verse__card--break';
                    }
                    return <Card character={character} showExpandButton={isValidCharacter}
                        isAnswered={true} isTiny={true} isWide={Array.from(character).length > 1}
                        className={className} />;
                })
            }</div>;
        })}
    </div>
}

export default Poem;
