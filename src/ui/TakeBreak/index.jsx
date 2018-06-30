/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Button from './../Button';
import Card from './../Card';
import './styles.less';

import { getKnownWords } from './../../helpers/difficulty-ratings';
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
                <p>The brain degrades over time,
                    so please consider taking a break and playing again later!</p>
                <Button onClick={props.onButtonClick}>不要!</Button>
                <p>Hopefully the following words are beginning to look familiar...</p>
                <p>{props.seenWords.map(char =>
                    <span className='takebreak__char'>{char}</span>)}</p>
                <h2>Your word bank</h2>
                {
                    props.knownWords.map(character => <Card character={character}
                        isKnown={true} isAnswered={true} isTiny={true} />)
                }
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
    const learned = knownWords.length - initialState.known;
    return Object.assign({}, props, {
        seenWords,
        knownWords,
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
