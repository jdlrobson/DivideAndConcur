/** @jsx h */
import { Component, h } from 'preact';
import Card from '../Card';
import './styles.less';

const getPoemCharacterClass = (char, { knownWords, seenWords, hardWords }) => {
    const classes = [];
    if ([ '，', '。', '；', '、' ].includes(char)) {
        return 'poem__verse--special';
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

const Poem = ({ knownWords, seenWords, hardWords, poem }) => {
    const lines = poem.split('\n');

    return <div class="poem">
        {lines.map((line) => {
            return <div class="poem__verse">{
                Array.from(line).map((char) =>
                    <Card character={char} isTiny={true} showExpandButton={true}
                        isAnswered={true}
                        className={getPoemCharacterClass(char, { knownWords, seenWords, hardWords })} />)
            }</div>;
        })}
    </div>
}

export default Poem;
