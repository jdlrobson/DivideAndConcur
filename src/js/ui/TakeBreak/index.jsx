/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Button from './../Button';
import Card from './../Card';
import './styles.less';
import { POEMS } from '../../constants';

import { getDifficultWordsHardestFirst, getKnownWords,
    getUniqueChars } from './../../helpers/difficulty-ratings';
import { resetNumRounds, dismountCurrentGame } from './../../actions';

const getPoemCharacterClass = (char, props) => {
    const classes = [];
    if ([ '，', '。' ].includes(char)) {
        return 'poem__verse--special';
    }
    if (props.knownWords.includes(char)) {
        classes.push('poem__verse__card--known');
    }
    if (props.seenWords.includes(char)) {
        classes.push('poem__verse__card--seen');
    } else {
        classes.push('poem__verse__card--unseen');
    }
    if (props.hardWords.includes(char)) {
        classes.push('poem__verse__card--hard');
    }
    return classes.join(' ');
}

const todaysPoem = POEMS[Math.floor(Math.random() * POEMS.length)];

const Poem = (text, props) => {
    const lines = text.split('\n');

    return <div class="poem">
        {lines.map((line) => {
            return <div class="poem__verse">{
                Array.from(line).map((char) =>
                    <Card character={char} isSmall={true}
                        isAnswered={true}
                        className={getPoemCharacterClass(char, props)} />)
            }</div>;
        })}
    </div>
}

class TakeBreak extends Component {
    render(props) {

        return (
            <div className='game'>
                <p>You've been playing some time today!</p>
                <p>You've looked at {props.seenWords.length} different words!</p>
                {
                    props.learned > 0 &&
                        <p>You've strengthened {props.learned} words!</p>
                }
                {
                    props.learnedChars > 0 &&
                        <p>You've strengthened {props.learnedChars} unique characters.</p>
                }
                <p>Your brain is probably tired right now,
                    so please consider taking a break and playing again later!</p>
                <Button onClick={props.onButtonClick}>不要!</Button>
                <strong>Your word bank contains {props.knownWords.length} characters</strong>
                <p>Hopefully things written in Chinese are starting to look more familiar...</p>
                {Poem(todaysPoem, props)}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {
        initialState,
        answers,
        seenWords
    } = state;

    const knownWords = getKnownWords(answers);
    const hardWords = getDifficultWordsHardestFirst(answers);
    const uniqueChars = getUniqueChars(knownWords);
    const learned = knownWords.length - initialState.known;
    const learnedChars = uniqueChars.length - initialState.known;
    return Object.assign({}, props, {
        seenWords,
        knownWords,
        hardWords,
        learnedChars,
        learned
    });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onButtonClick: () => {
            dispatch(resetNumRounds());
            dispatch(dismountCurrentGame());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TakeBreak);
