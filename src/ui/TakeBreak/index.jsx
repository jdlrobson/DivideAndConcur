/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Button from './../Button';
import Card from './../Card';
import './styles.less';

import { getDifficultWordsHardestFirst, getKnownWords,
    getUniqueChars } from './../../helpers/difficulty-ratings';
import { resetNumRounds, dismountCurrentGame } from './../../actions';

class TakeBreak extends Component {
    render(props) {
        return (
            <div className='game'>
                <p>You've been playing some time today!</p>
                <p>You've looked at {props.seenWords.length} words!</p>
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
                <p>Hopefully the following words are beginning to look familiar...</p>
                <p>{props.seenWords.map(char =>
                    <span className='takebreak__char'>{char}</span>)}</p>
                <h2>Your word bank contains {props.knownWords.length} characters</h2>
                <p>Learn these words for next time to win more cards!</p>
                <div className="takebreak__learn">{
                    props.hardWords.map(character => <Card character={character}
                        isKnown={false} isAnswered={true} />)
                }</div>
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
