/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Overlay from './Overlay';
import { maxSize } from './../helpers/cards';
import { getDifficultWordsHardestFirst, getKnownWordCount, getUnKnownWordCount, getKnownWords } from './../helpers/difficulty-ratings';
import Button from './Button';
import Poem from './Poem';

const WordBankOverlay = ({ onClickExit, poem, knownWordCount, maxSize,
    words,
    knownWords, seenWords, hardWords }) => {
    return <Overlay>
        <p>
            Qie Qie helps you gain familiarity with the characters you need.
        </p>
        <p>The word bank tells you how many characters you need to know.</p>
        <p>Right now you have learned {knownWordCount} words out of {maxSize}.</p>
        <p>With time you'll be able to read things like this:</p>
        <Poem {...{ knownWords, seenWords, hardWords, poem, words }} />
        <Button className='app__overlay__button'
                    onClick={onClickExit}>Got it!</Button>
    </Overlay>
}

const mapDispatchToProps = (dispatch, props) => {
    return {}
};

const mapStateToProps = (state, props) => {
    const {
        poem,
        words,
        seenWords,
        answers
    } = state;

    const knownWordCount = getKnownWordCount(answers);
    const knownWords = getKnownWords(answers);
    const hardWords = getDifficultWordsHardestFirst(answers);
    // While we're building out the game it's possible I've removed words from the game
    // that are included in unknown word count.
    const unknownWordCount = Math.min(maxSize - knownWordCount, getUnKnownWordCount(answers));

    return Object.assign({}, props, {
        words,
        poem, knownWords, hardWords, seenWords,
        unknownWordCount,
        knownWordCount,
        maxSize  });
};

export default connect(mapStateToProps, mapDispatchToProps)(WordBankOverlay);
