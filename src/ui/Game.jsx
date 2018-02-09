/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import FlashcardRound from './FlashcardRound';
import GameDescription from './GameDescription';
import './game.less';

import { startRound } from './../actions';

class Game extends Component {
    componentDidMount() {
        this.props.onStart();
    }
    render(props) {
        const cards = props.cards ? <FlashcardRound cards={props.cards} round={0} /> : false;
        const loader = <div>Loading up!</div>;

        return (
            <div className='game' onClick={props.onCanvasClick}>
                <GameDescription>{props.description}</GameDescription>
                {cards || loader }
                {props.previous && props.previous.length > 0 &&
                    <h3 className='game__history-header'>Words you have recently learned</h3>}
                <FlashcardRound key={'round-past'} cards={props.previous} round={1} />
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const {
        previous,
        cards
    } = state;

    return Object.assign({}, props, {
    // limit to last 50 so we dont render too much on DOM
        previous: previous.slice(0, 50),
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
