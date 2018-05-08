/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import FlashcardRound from './FlashcardRound';
import './game.less';

import { startRound } from './../actions';

class Game extends Component {
    componentDidMount() {
        if (!this.props.cards.length) {
            this.props.onStart();
        }
    }
    render(props) {
        const cards = props.cards ? <FlashcardRound cards={props.cards} round={0} /> : false;
        const loader = <div>Loading up!</div>;

        return (
            <div className='game' onClick={props.onCanvasClick}>
                {cards || loader }
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {
        game,
        cards
    } = state;

    return Object.assign({}, props, {
        game,
        cards
    });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onStart: () => {
            dispatch(startRound());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
