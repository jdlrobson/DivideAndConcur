/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Button from './../Button';
import './styles.less';

import { resetNumRounds, dismountCurrentGame } from './../../actions';

class TakeBreak extends Component {
    render(props) {
        return (
            <div className='game'>
                <p>You've been playing some time today!</p>
                <p>You've looked at {props.seenWords.length} words!</p>
                <p>The brain degrades over time,
                    so please consider taking a break and playing again later!</p>
                <Button onClick={props.onButtonClick}>Bu yao!</Button>
                <p>Hopefully the following words are beginning to look familiar...</p>
                <p>{props.seenWords.map(char =>
                    <span className='takebreak__char'>{char}</span>)}</p>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {
        seenWords
    } = state;

    return Object.assign({}, props, {
        seenWords
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
